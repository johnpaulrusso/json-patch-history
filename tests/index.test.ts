import { immutableJSONPatch, JSONPatchOperation } from 'immutable-json-patch';
import { IPatchHistory, initializeHistory, getRedoPatches, getApplyPatches, getUndoPatches } from '../src/index'

interface TestSubject {
    a: number,
    b: string
}

var testSubject: TestSubject
var history: IPatchHistory = initializeHistory();

const p0: JSONPatchOperation = {
    op: 'replace',
    path: '/a',
    value: 2
}
const p1: JSONPatchOperation = {
    op: 'replace',
    path: '/b',
    value: 'world'
}

beforeEach(() => {
    testSubject = {
        a: 1,
        b: "hello"
    }
    history = initializeHistory();
});

test.only('Patch', () => {
    const savePatches = getApplyPatches(testSubject, history, [p0]);

    expect(savePatches.subjectPatches.length).toBe(1);
    expect(savePatches.historyPatches.length).toBe(3);

    const patchStackPatch = savePatches.historyPatches.at(0);
    const undoStackPatch = savePatches.historyPatches.at(1);
    const redoStackPatch = savePatches.historyPatches.at(2);

    expect(patchStackPatch?.op).toBe('add');
    expect(undoStackPatch?.op).toBe('add');
    expect(redoStackPatch?.op).toBe('replace');

    testSubject = immutableJSONPatch(testSubject, savePatches.subjectPatches);
    history = immutableJSONPatch(history, savePatches.historyPatches);

    expect(testSubject.a).toBe(2)
    expect(history.patchStack.length).toBe(1)
    expect(history.undoStack.length).toBe(1)
    expect(history.redoStack.length).toBe(0)
});


test.only('Undo', () => {
    const savePatches = getApplyPatches(testSubject, history, [p0]);
    
    testSubject = immutableJSONPatch(testSubject, savePatches.subjectPatches);
    history = immutableJSONPatch(history, savePatches.historyPatches);

    const undoPatches = getUndoPatches(history);    
    testSubject = immutableJSONPatch(testSubject, undoPatches.subjectPatches);
    history = immutableJSONPatch(history, undoPatches.historyPatches);

    expect(testSubject.a).toBe(1)
    expect(history.patchStack.length).toBe(0)
    expect(history.undoStack.length).toBe(0)
    expect(history.redoStack.length).toBe(1)
});

test.only('Redo', () => {
    const savePatches = getApplyPatches(testSubject, history, [p0]);
    testSubject = immutableJSONPatch(testSubject, savePatches.subjectPatches);
    history = immutableJSONPatch(history, savePatches.historyPatches);

    const undoPatches = getUndoPatches(history);
    testSubject = immutableJSONPatch(testSubject, undoPatches.subjectPatches);
    history = immutableJSONPatch(history, undoPatches.historyPatches);

    const redoPatches = getRedoPatches(testSubject, history);
    testSubject = immutableJSONPatch(testSubject, redoPatches.subjectPatches);
    history = immutableJSONPatch(history, redoPatches.historyPatches);

    expect(testSubject.a).toBe(2)
    expect(history.patchStack.length).toBe(1)
    expect(history.undoStack.length).toBe(1)
    expect(history.redoStack.length).toBe(0)
});

test.only('Patch Undo Patch', () => {
    const savePatches = getApplyPatches(testSubject, history, [p0]);
    testSubject = immutableJSONPatch(testSubject, savePatches.subjectPatches);
    history = immutableJSONPatch(history, savePatches.historyPatches);

    const undoPatches = getUndoPatches(history);
    testSubject = immutableJSONPatch(testSubject, undoPatches.subjectPatches);
    history = immutableJSONPatch(history, undoPatches.historyPatches);

    const savePatches2 = getApplyPatches(testSubject, history, [p1]);
    testSubject = immutableJSONPatch(testSubject, savePatches2.subjectPatches);
    history = immutableJSONPatch(history, savePatches2.historyPatches);

    expect(testSubject.a).toBe(1)
    expect(testSubject.b).toBe('world')
    expect(history.patchStack.length).toBe(1)
    expect(history.undoStack.length).toBe(1)
    expect(history.redoStack.length).toBe(0)
});
