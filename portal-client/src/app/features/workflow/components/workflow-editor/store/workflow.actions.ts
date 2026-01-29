import { createAction, props } from '@ngrx/store';

export interface WorkflowNode {
  id: string;
  type: 'text' | 'action' | 'condition' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    text?: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const addNode = createAction('[Workflow] Add Node', props<{ node: WorkflowNode }>());
export const updateNode = createAction('[Workflow] Update Node', props<{ id: string; updates: Partial<WorkflowNode> }>());
export const deleteNode = createAction('[Workflow] Delete Node', props<{ id: string }>());
export const addEdge = createAction('[Workflow] Add Edge', props<{ edge: WorkflowEdge }>());
export const deleteEdge = createAction('[Workflow] Delete Edge', props<{ id: string }>());
export const updateNodes = createAction('[Workflow] Update Nodes', props<{ nodes: WorkflowNode[] }>());
export const updateEdges = createAction('[Workflow] Update Edges', props<{ edges: WorkflowEdge[] }>());
export const reset = createAction('[Workflow] Reset');

