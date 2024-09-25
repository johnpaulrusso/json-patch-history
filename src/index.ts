import {
  revertJSONPatch,
  JSONPatchDocument,
  JSONPatchOperation,
} from 'immutable-json-patch';

export interface IPatchHistory {
  /**
   * patchStack
   * Stack of JSON Patch objects P.
   * Patch history.
   * Usage: All patches applied to the state should be pushed onto this stack. (Except undo patches.)
   */
  patchStack: JSONPatchDocument[];
  /**
   * undoStack
   * Stack of JSON Patch objects required to UNDO an operation.
   * The user should be able to feed the objects from this stack directly into JSON patch.
   * Usage: When the undo action is performed, the top of the undo stack should be popped and applied to the state.
   * Note: U[i] = -P[i]
   */
  undoStack: JSONPatchDocument[];

  /**
   * redoStack
   * Stack of JSON Patch objects required to REDO an operation.
   * The user should be able to feed the objects from this stack directly into JSON patch.
   * Usage: When the undo action is performed, the top of the patch stack should be popped and pushed onto the redo stack.
   * Usage: When the redo action is performed, the top of the redo stack should be popped and applied to the state.
   */
  redoStack: JSONPatchDocument[];
}

export type PatchHistoryResult = {
  subjectPatches: JSONPatchDocument;
  historyPatches: JSONPatchDocument;
};

export function initializeHistory() {
  return {
    patchStack: [],
    undoStack: [],
    redoStack: [],
  };
}

/**
 * @param subject latest version of the subject with a history interface.
 * CALL THIS BEFORE PATCHING THE SUBJECT
 */
export function getApplyPatches(
  subject: object,
  history: IPatchHistory,
  patches: JSONPatchDocument,
): PatchHistoryResult {
  //Always clear the redo stack when applying a new patch.
  const redoStackPatch: JSONPatchOperation = {
    op: 'replace',
    path: `/redoStack`,
    value: [],
  };

  const results: PatchHistoryResult = getApplyPatchesWithoutClearingRedoStack(
    subject,
    history,
    patches,
  );
  results.historyPatches = results.historyPatches.concat(redoStackPatch);

  return results;
}

export function getUndoPatches(history: IPatchHistory): PatchHistoryResult {
  const patchStackSize = history.patchStack.length;
  const undoStackSize = history.undoStack.length;
  const redoStackSize = history.redoStack.length;

  if (undoStackSize == 0) {
    return {
      subjectPatches: [],
      historyPatches: [],
    }; //Nothing to undo!
  }

  //Actual patches used to perform the UNDO operation.
  const undoPatches = history.undoStack.at(undoStackSize - 1) ?? [];

  const patchStackPatch: JSONPatchOperation = {
    op: 'remove',
    path: `/patchStack/${patchStackSize - 1}`,
  };

  const undoStackPatch: JSONPatchOperation = {
    op: 'remove',
    path: `/undoStack/${undoStackSize - 1}`,
  };

  const patchToRedo = history.patchStack.at(patchStackSize - 1);
  const redoStackPatch: JSONPatchOperation = {
    op: 'add',
    path: `/redoStack/${redoStackSize}`,
    value: patchToRedo,
  };

  return {
    subjectPatches: undoPatches,
    historyPatches: [patchStackPatch, undoStackPatch, redoStackPatch],
  };
}

export function getRedoPatches(
  subject: object,
  history: IPatchHistory,
): PatchHistoryResult {
  const redoStackSize = history.redoStack.length;
  if (redoStackSize == 0) {
    return {
      subjectPatches: [],
      historyPatches: [],
    }; //Nothing to redo!
  }

  //Actual patches used to perform the UNDO operation.
  const redoPatches = history.redoStack.at(redoStackSize - 1) ?? [];

  const redoStackPatch: JSONPatchOperation = {
    op: 'remove',
    path: `/redoStack/${redoStackSize - 1}`,
  };

  const result = getApplyPatchesWithoutClearingRedoStack(
    subject,
    history,
    redoPatches,
  );

  result.historyPatches = result.historyPatches.concat(redoStackPatch);

  return result;
}

function getApplyPatchesWithoutClearingRedoStack(
  subject: object,
  history: IPatchHistory,
  patches: JSONPatchDocument,
): PatchHistoryResult {
  const patchStackSize = history.patchStack.length;
  const undoStackSize = history.undoStack.length;

  const undoPatches = revertJSONPatch(subject, patches);

  const patchStackPatch: JSONPatchOperation = {
    op: 'add',
    path: `/patchStack/${patchStackSize}`,
    value: patches,
  };
  const undoStackPatch: JSONPatchOperation = {
    op: 'add',
    path: `/undoStack/${undoStackSize}`,
    value: undoPatches,
  };

  return {
    subjectPatches: patches,
    historyPatches: [patchStackPatch, undoStackPatch],
  };
}
