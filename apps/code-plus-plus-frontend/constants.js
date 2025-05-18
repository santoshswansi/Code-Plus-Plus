export const LOGIN_MODE = "LOGIN";
export const SIGNUP_MODE = "SIGNUP";
export const CODE = "CODE";
export const WHITEBOARD = "WHITEBOARD";
export const COLLABORATORS = "COLLABORATORS";
export const SETTINGS = "SETTINGS";
export const PROJECTS = "PROJECTS";
export const DEFAULT_TAB_MODE = CODE;
import {cpp, java, python, STROKE_COLORS, STROKE_WIDTHS} from "../../packages//constants";

export const TAB_TO_ROUTE = {
  [CODE] : "/code",
  [WHITEBOARD]: "/whiteboard",
  [COLLABORATORS]: "/collaborators",
  [SETTINGS]: "/settings",
  [PROJECTS]: "/projects",
}

export const LANGUAGE_TO_FILE_EXTENSION = {
  [cpp]: ".cpp",
  [java]: ".java",
  [python]: ".py",
};

export const LANGUAGE_NAME_TO_MONACO_LANGUAGE = {
  [cpp]: "cpp",
  [java]: "java",
  [python]: "python"
}

export const LANGUAGE_NAME_TO_PISTON_LANGUAGE = {
  [cpp]: "cpp",
  [java]: "java",
  [python]: "python"
}

export const PENCIL = "PENCIL";
export const ERASER = "ERASER";
export const BLACK = "BLACK";
export const BLUE = "BLUE";
export const RED = "RED";
export const STROKE_WIDTH_1 = "STROKE_WIDTH_1";
export const STROKE_WIDTH_2 = "STROKE_WIDTH_2";
export const STROKE_WIDTH_3 = "STROKE_WIDTH_3";
export const DEFAULT_PENCIL_ERASER = PENCIL;
export const DEFAULT_STROKE_WIDTH_NAME = STROKE_WIDTH_1;
export const DEFAULT_STROKE_COLOR_NAME = BLACK;
export const ERASE_DISTANCE = 10;

export const STROKE_COLOR_NAME_TO_ACTUAL_COLOR = {
  [BLACK]: STROKE_COLORS[0],
  [BLUE]: STROKE_COLORS[1],
  [RED]: STROKE_COLORS[2],
}

export const STROKE_WIDTH_NAME_TO_ACTUAL_WIDTH = {
  [STROKE_WIDTH_1]: STROKE_WIDTHS[0],
  [STROKE_WIDTH_2]: STROKE_WIDTHS[1],
  [STROKE_WIDTH_3]: STROKE_WIDTHS[2],
}

export const TRUE = true;
export const FALSE = false;
export const EDITOR_DARK = "vs-dark";
export const EDITOR_LIGHT = "vs-light";
export const EDITOR_FONT_SIZE_1 = 12;
export const EDITOR_FONT_SIZE_2 = 15;
export const EDITOR_FONT_SIZE_3 = 18;
export const EDITOR_TAB_SIZE_1 = 2;
export const EDITOR_TAB_SIZE_2 = 4;
export const DEFAULT_AUTO_SAVE = TRUE;
export const DEFAULT_MINIMAP = FALSE;
export const DEFAULT_EDITOR_THEME = EDITOR_DARK;
export const DEFAULT_FONT_SIZE = EDITOR_FONT_SIZE_3;
export const DEFAULT_TAB_SIZE = EDITOR_TAB_SIZE_2;

export const UPDATE_MODE = "UPDATE";
export const CREATE_MODE = "CREATE";
export const ADD_MODE = "ADD";

export const PLAYGROUND_PROJECT_ID = "asfhkshfovsgdfskgfbww4yqrvyu2y6368397r82ryg8y2v8";
export const PLAYGROUND_PROJECT_NAME = "Playground";
export const PLAYGROUND_PROJECT_SUBTITLE = "Your playground outside of project";

export const PAGINATION_LIMIT = 10;

export const UNSAVED = "Unsaved ✎";
export const SAVED = "Saved ✓";
export const ERROR = "Error saving ✗";
export const SAVING = "Saving ...";

export const DEBOUNCED_CALLBACK_MS = 5000;
export const PROJECT_SKELETIONS_SIZE = 10;
