import { createFeatureSelector, createSelector } from '@ngrx/store';
import { workflowFeature, WorkflowState } from './workflow.reducer';

export const selectWorkflowState = createFeatureSelector<WorkflowState>(workflowFeature.name);

export const selectNodes = createSelector(
  selectWorkflowState,
  (state) => state.nodes
);

export const selectEdges = createSelector(
  selectWorkflowState,
  (state) => state.edges
);

