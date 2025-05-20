"use client";
import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGE_NAME_TO_MONACO_LANGUAGE } from "@/constants";
import useCodeEditorStore from "@/store/useCodeEditorStore";
import useGlobalStore from "@/store/useGlobalStore";

function CodeEditor({handleCodeChange}) {
  const { tabSize, fontSize, theme, minimap } = useCodeEditorStore();
  const { currProject } = useGlobalStore();

  const editorRef = useRef(null);
  const currTab = currProject.codeTabs[currProject.currCodeTabIdx];

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="h-full relative">
      <Editor
        className="h-full"
        theme={theme}
        options={{
          insertSpaces: true,
          tabSize,
          fontSize,
          minimap: { enabled: minimap },
          detectIndentation: false
        }}
        language={LANGUAGE_NAME_TO_MONACO_LANGUAGE[currTab.language]}
        value={currTab.code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default CodeEditor;