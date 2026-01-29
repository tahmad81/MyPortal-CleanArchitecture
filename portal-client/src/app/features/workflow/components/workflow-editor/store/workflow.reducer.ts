import { createFeature, createReducer, on } from '@ngrx/store';
import * as WorkflowActions from './workflow.actions';
import { WorkflowNode, WorkflowEdge } from './workflow.actions';

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const initialState: WorkflowState = {
  nodes: [],
  edges: []
};

export const workflowFeature = createFeature({
  name: 'workflow',
  reducer: createReducer(
    initialState,
    on(WorkflowActions.addNode, (state, { node }) => ({
      ...state,
      nodes: [...state.nodes, node]
    })),
    on(WorkflowActions.updateNode, (state, { id, updates }) => ({
      ...state,
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    })),
    on(WorkflowActions.deleteNode, (state, { id }) => ({
      ...state,
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(edge => edge.source !== id && edge.target !== id)
    })),
    on(WorkflowActions.addEdge, (state, { edge }) => ({
      ...state,
      edges: [...state.edges, edge]
    })),
    on(WorkflowActions.deleteEdge, (state, { id }) => ({
      ...state,
      edges: state.edges.filter(edge => edge.id !== id)
    })),
    on(WorkflowActions.updateNodes, (state, { nodes }) => ({
      ...state,
      nodes
    })),
    on(WorkflowActions.updateEdges, (state, { edges }) => ({
      ...state,
      edges
    })),
    on(WorkflowActions.reset, () => initialState)
  )
});

