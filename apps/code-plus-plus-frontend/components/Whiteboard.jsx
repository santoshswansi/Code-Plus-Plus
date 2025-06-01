"use client";
import React, { useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  ERASE_DISTANCE,
  ERASER,
  PENCIL,
  STROKE_COLOR_NAME_TO_ACTUAL_COLOR,
  STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH,
  DEBOUNCED_CALLBACK_MS,
  SAVING,
  SAVED,
  ERROR,
  PLAYGROUND_PROJECT_ID,
  UNSAVED,
} from "@/constants";
import useGlobalStore from "@/store/useGlobalStore";
import { handleUpdateWhiteboardTabToProject } from "@/api/project";
import rough from "roughjs";
import * as Y from "yjs";
import useAuthStore from "@/store/useAuthStore";
import { WHITEBOARD } from "../../../packages/constants";

const createSmoothPath = (points) => {
  if(points.length < 2) 
    return "";
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for(let i = 1; i < points.length - 1; i++){
    const midX = (points[i][0] + points[i + 1][0])/2;
    const midY = (points[i][1] + points[i + 1][1])/2;
    path += ` Q ${points[i][0]} ${points[i][1]}, ${midX} ${midY}`;
  }

  return path;
}

const isPointNear = (x1, y1, x2, y2, distance) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx*dx + dy*dy <= distance*distance;
}

const Whiteboard = ({ isPencilOrEraser, strokeColorName, strokeWidthName }) => {
  const svgRef = useRef(null);
  const rcRef = useRef(null);
  const currentStrokeIndexRef = useRef(null);
  const isDrawingRef = useRef(false);
  const yShapesRef = useRef(null);

  const { currProject, currUserHasEditAccessRightToCurrProject, setSaveStatus } = useGlobalStore();
  const currTab = currProject.whiteboardTabs[currProject.currWhiteboardTabIdx];
  const { whiteboardTabId } = currTab;
  const { accessToken } = useAuthStore();

  const saveToBackend = async (shapesArray) => {
    if(currProject.projectId === PLAYGROUND_PROJECT_ID) 
      return;

    setSaveStatus(SAVING);
    try{
      const success = await handleUpdateWhiteboardTabToProject(
        currProject.projectId,
        whiteboardTabId,
        { shapes: shapesArray }
      );
      setSaveStatus(success ? SAVED : ERROR);
    }catch{
      setSaveStatus(ERROR);
    }
  };

  const debouncedSave = useDebouncedCallback((shapesArray) => {
    saveToBackend(shapesArray);
  }, DEBOUNCED_CALLBACK_MS);

  useEffect(() => {
    const svgEl = svgRef.current;
    if(!svgEl) 
      return;

    while(svgEl.firstChild){
      svgEl.removeChild(svgEl.firstChild);
    }

    rcRef.current = rough.svg(svgEl);

    const yDoc = new Y.Doc();
    yShapesRef.current = yDoc.getArray("shapes");

    const ws = new WebSocket(`ws://localhost:3300/${whiteboardTabId}?projectId=${currProject.projectId}&token=${accessToken}&tabType=${WHITEBOARD}`);
    ws.binaryType = "arraybuffer";

    yDoc.on("update", (update) => {
      if(ws.readyState === WebSocket.OPEN){
        ws.send(update);
      }
    });

    ws.onmessage = (event) => {
      Y.applyUpdate(yDoc, new Uint8Array(event.data));
    };

    const draw = () => {
      if(!svgRef.current || !rcRef.current) 
        return;
      while(svgRef.current.firstChild){
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      yShapesRef.current.toArray().forEach((stroke) => {
        const points = stroke.points;
        if(!points || points.length === 0) 
          return;

        if(points.length === 1){
          const [x, y] = points[0];
          const circle = rcRef.current.circle(x, y, stroke.options.strokeWidth, {
            stroke: stroke.options.stroke,
            strokeWidth: stroke.options.strokeWidth,
            fill: stroke.options.stroke,
            roughness: stroke.options.roughness,
            fillStyle: "solid",
          });
          svgRef.current.appendChild(circle);
        }else{
          const smoothPath = createSmoothPath(points);
          const path = rcRef.current.path(smoothPath, {
            stroke: stroke.options.stroke,
            strokeWidth: stroke.options.strokeWidth,
            roughness: stroke.options.roughness,
          });
          svgRef.current.appendChild(path);
        }
      });
    };

    yShapesRef.current.observe(draw);

    return () => {
      yShapesRef.current.unobserve(draw);
      yDoc.off("update", () => {});
      ws.close();
      debouncedSave.cancel();
    };
  }, [
    currProject.projectId,
    currProject.currWhiteboardTabIdx,
  ]);

  const handleMouseDown = (e) => {
    if(!currUserHasEditAccessRightToCurrProject) 
      return;
    const svgEl = svgRef.current;
    if(!svgEl || !yShapesRef.current) 
      return;

    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    setSaveStatus(UNSAVED);

    if(isPencilOrEraser === PENCIL){
      yShapesRef.current.push([
        {
          points: [[x, y]],
          options: {
            stroke: STROKE_COLOR_NAME_TO_ACTUAL_COLOR[strokeColorName],
            roughness: 0,
            strokeWidth: STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH[strokeWidthName],
          },
        },
      ]);
      currentStrokeIndexRef.current = yShapesRef.current.length - 1;
    }else if(isPencilOrEraser === ERASER){
      let didErase = false;
      for(let i = yShapesRef.current.length - 1; i >= 0; i--){
        const shape = yShapesRef.current.get(i);
        if(!shape?.points) 
          continue;
        
        for(const [px, py] of shape.points){
          if(isPointNear(x, y, px, py, ERASE_DISTANCE)){
            yShapesRef.current.delete(i, 1);
            didErase = true;
            break;
          }
        }
      }

      if(didErase){
        setSaveStatus(UNSAVED);
        debouncedSave(yShapesRef.current.toArray());
      }
    }
  };

  const handleMouseMove = (e) => {
    if(!currUserHasEditAccessRightToCurrProject || !isDrawingRef.current) 
      return;
    const svgEl = svgRef.current;
    if(!svgEl || !yShapesRef.current) 
      return;

    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if(isPencilOrEraser === PENCIL){
      const idx = currentStrokeIndexRef.current;
      const stroke = idx !== null ? yShapesRef.current.get(idx) : null;
      if(!stroke) 
        return;

      stroke.points.push([x, y]);
      yShapesRef.current.delete(idx, 1);
      yShapesRef.current.insert(idx, [stroke]);
    }else if(isPencilOrEraser === ERASER){
      let didErase = false;
      for(let i = yShapesRef.current.length - 1; i >= 0; i--){
        const shape = yShapesRef.current.get(i);
        if(!shape?.points) 
          continue;

        for(const [px, py] of shape.points){
          if(isPointNear(x, y, px, py, ERASE_DISTANCE)){
            yShapesRef.current.delete(i, 1);
            didErase = true;
            break;
          }
        }
      }

      if(didErase){
        setSaveStatus(UNSAVED);
        debouncedSave(yShapesRef.current.toArray());
      }
    }
  };

  const handleMouseUp = () => {
    if(!currUserHasEditAccessRightToCurrProject) 
      return;

    isDrawingRef.current = false;
    if(isPencilOrEraser === PENCIL && currentStrokeIndexRef.current !== null){
      const idx = currentStrokeIndexRef.current;
      const stroke = yShapesRef.current?.get(idx);
      if(stroke && stroke.points.length === 1 && yShapesRef.current){
        yShapesRef.current.delete(idx, 1);
        yShapesRef.current.insert(idx, [stroke]);
      }

      currentStrokeIndexRef.current = null;
      if(yShapesRef.current){
        debouncedSave(yShapesRef.current.toArray());
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          cursor: isPencilOrEraser === ERASER ? "grab" : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default Whiteboard;