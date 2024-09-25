# JSON Patch History

**JSON Patch History** is a set of interfaces and functions that provide undo/redo JSON Patch tracking, allowing you to manage changes to JSON documents. This package helps track the history of applied patches and easily allows for undo/redo operations on JSON objects. Use standard JSON Patch operations (RFC 6902). This package is currently dependent on the `immutable-json-patch`

## Installation

To install the package, use npm:

```bash
npm install json-patch-history
```

## Basic Usage

The following example demonstrates how to set up patch tracking, apply patches to a subject, and use undo/redo functionality:

```javascript
// Setup
import { 
  initializeHistory, 
  getApplyPatches, 
  getUndoPatches, 
  getRedoPatches 
} from 'json-patch-history';
import { immutableJSONPatch } from 'immutable-json-patch';

// Initial subject and history setup
let subject = { foo: 'bar' }; // The object we want to track changes for
let history = initializeHistory(); // Initialize patch history

// Create a patch to modify the subject
const patch = { op: 'replace', path: '/foo', value: 'baz' };

// Apply patch to the subject and track it in the history
const patchesToApply = getApplyPatches(subject, history, [patch]);
subject = immutableJSONPatch(subject, patchesToApply.subjectPatches);
history = immutableJSONPatch(history, patchesToApply.historyPatches);

// Subject and history after applying the patch:
// subject: { foo: 'baz' }
// history.patchStack: [{ op: 'replace', path: '/foo', value: 'baz' }]
// history.undoStack: [{ op: 'replace', path: '/foo', value: 'bar' }]
// history.redoStack: []

// Undo the change
const undoPatches = getUndoPatches(history);
subject = immutableJSONPatch(subject, undoPatches.subjectPatches);
history = immutableJSONPatch(history, undoPatches.historyPatches);

// Subject and history after undo:
// subject: { foo: 'bar' }
// history.patchStack: []
// history.undoStack: []
// history.redoStack: [{ op: 'replace', path: '/foo', value: 'baz' }]

// Redo the change
const redoPatches = getRedoPatches(subject, history);
subject = immutableJSONPatch(subject, redoPatches.subjectPatches);
history = immutableJSONPatch(history, redoPatches.historyPatches);

// Subject and history after redo:
// subject: { foo: 'baz' }
// history.patchStack: [{ op: 'replace', path: '/foo', value: 'baz' }]
// history.undoStack: [{ op: 'replace', path: '/foo', value: 'bar' }]
// history.redoStack: []
```

## API

### `initializeHistory(): IPatchHistory`
Initializes an empty patch history.

```javascript
interface IPatchHistory {
  patchStack: JSONPatchDocument[];
  undoStack: JSONPatchDocument[];
  redoStack: JSONPatchDocument[];
}
```

### `getApplyPatches(subject: object, history: IPatchHistory, patches: JSONPatchDocument): PatchHistoryResult`
Applies a set of patches to the subject and updates the history.

**Parameters:**
- `subject`: The object being modified.
- `history`: The current patch history.
- `patches`: A JSON Patch array to apply to the subject.

**Returns:**
- `subjectPatches`: The patches to apply to the subject.
- `historyPatches`: The patches to apply to the history.

### `getUndoPatches(history: IPatchHistory): PatchHistoryResult`
Returns the patches necessary to undo the most recent change to the subject.

### `getRedoPatches(subject: object, history: IPatchHistory): PatchHistoryResult`
Returns the patches necessary to redo the most recently undone change to the subject.

### `PatchHistoryResult`

```typescript
type PatchHistoryResult = {
  subjectPatches: JSONPatchDocument;
  historyPatches: JSONPatchDocument;
};
```

## Contributing
If you'd like to contribute to this project, feel free to open a pull request or report issues. Contributions are welcome!

## License
This package is licensed under the MIT License.
