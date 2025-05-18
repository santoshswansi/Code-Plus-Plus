"use client";
import React, { useRef, useState, useEffect } from "react";
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
  UNSAVED
} from "@/constants";
import useGlobalStore from "@/store/useGlobalStore";
import { handleUpdateWhiteboardTabToProject } from "@/api/project";

const Whiteboard = ({ isPencilOrEraser, strokeColorName, strokeWidthName }) => {
  const svgRef = useRef(null);
  const { currProject, updateWhiteboardTab, setSaveStatus, currUserHasEditAccessRightToCurrProject } = useGlobalStore();
  const [isDragging, setIsDragging] = useState(false);

  const currTab = currProject.whiteboardTabs[currProject.currWhiteboardTabIdx];
  const { whiteboardTabId, paths, dots } = currTab;

  const getMousePos = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    if(currUserHasEditAccessRightToCurrProject){
      const { x, y } = getMousePos(e);
      setIsDragging(true);
      setSaveStatus(UNSAVED);

      if (isPencilOrEraser === ERASER) eraseElement(x, y);
      else updateWhiteboardTab(whiteboardTabId, { currPath: [[x, y]] });
    }
  };

  const handleMouseMove = (e) => {
    if(currUserHasEditAccessRightToCurrProject){
      if(!isDragging) return;
      const { x, y } = getMousePos(e);

      if(isPencilOrEraser === ERASER) eraseElement(x, y);
      else{
        updateWhiteboardTab(whiteboardTabId, {
          currPath: [...currTab.currPath, [x, y]]
        });
      }
    }
  };

  const handleMouseUp = (e) => {
    if(currUserHasEditAccessRightToCurrProject){
      setIsDragging(false);
      const { x, y } = getMousePos(e);

      if(isPencilOrEraser === PENCIL){
        if (currTab.currPath.length === 1){
          updateWhiteboardTab(whiteboardTabId, {
            currPath: [],
            dots: [
              ...dots,
              {
                cx: currTab.currPath[0][0],
                cy: currTab.currPath[0][1],
                strokeColor: STROKE_COLOR_NAME_TO_ACTUAL_COLOR[strokeColorName],
                strokeWidth: STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH[strokeWidthName],
              },
            ],
          });
        } else {
          updateWhiteboardTab(whiteboardTabId, {
            currPath: [],
            paths: [
              ...paths,
              {
                points: currTab.currPath,
                strokeColor: STROKE_COLOR_NAME_TO_ACTUAL_COLOR[strokeColorName],
                strokeWidth: STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH[strokeWidthName],
              },
            ],
          });
        }

        if(currProject.projectId !== PLAYGROUND_PROJECT_ID)
          debouncedSave();
      }
    }
  };

  const eraseElement = (x, y) => {
    if(currUserHasEditAccessRightToCurrProject){
      updateWhiteboardTab(whiteboardTabId, {
        dots: dots.filter(({ cx, cy, strokeWidth }) =>
          getDistance(x, y, cx, cy) > strokeWidth
        ),
        paths: paths.filter((path) =>
          !path.points.some(([px, py]) => getDistance(x, y, px, py) < ERASE_DISTANCE)
        ),
      });

      if(currProject.projectId !== PLAYGROUND_PROJECT_ID)
        debouncedSave(); 
    }
  };

  const getDistance = (x1, y1, x2, y2) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const saveToBackend = async () => {
    if(currProject.projectId === PLAYGROUND_PROJECT_ID || !currUserHasEditAccessRightToCurrProject)
      return;
    setSaveStatus(SAVING);
    const success = await handleUpdateWhiteboardTabToProject(
      currProject.projectId,
      whiteboardTabId,
      {
        paths,
        dots,
        currPath: []
      }
    );

    setSaveStatus(success ? SAVED : ERROR);
  };

  const debouncedSave = useDebouncedCallback(saveToBackend, DEBOUNCED_CALLBACK_MS);

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  const generateSVGPath = (points) => {
    if(points.length < 2) return "";
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for(let i = 1; i < points.length - 1; i++){
      const midX = (points[i][0] + points[i + 1][0]) / 2;
      const midY = (points[i][1] + points[i + 1][1]) / 2;
      path += ` Q ${points[i][0]} ${points[i][1]}, ${midX} ${midY}`;
    }
    return path;
  };

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {paths.map((path, idx) => (
          <path
            key={idx}
            d={generateSVGPath(path.points)}
            stroke={path.strokeColor}
            strokeWidth={path.strokeWidth}
            fill="none"
          />
        ))}

        {currTab.currPath?.length > 1 && isPencilOrEraser === PENCIL && (
          <path
            d={generateSVGPath(currTab.currPath)}
            stroke={STROKE_COLOR_NAME_TO_ACTUAL_COLOR[strokeColorName]}
            strokeWidth={STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH[strokeWidthName]}
            fill="none"
          />
        )}

        {dots.map((dot, idx) => (
          <circle key={idx} cx={dot.cx} cy={dot.cy} r={dot.strokeWidth} fill={dot.strokeColor} />
        ))}
      </svg>
    </div>
  );
};

export default Whiteboard;