import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WorkflowNode, WorkflowEdge } from './workflow.actions';
import * as WorkflowActions from './workflow.actions';
import * as WorkflowSelectors from './workflow.selectors';

@Injectable({ providedIn: 'root' })
export class WorkflowFacade {
  private readonly store = inject(Store);

  readonly nodes$: Observable<WorkflowNode[]> = this.store.select(WorkflowSelectors.selectNodes);
  readonly edges$: Observable<WorkflowEdge[]> = this.store.select(WorkflowSelectors.selectEdges);

  addNode(node: WorkflowNode): void {
    this.store.dispatch(WorkflowActions.addNode({ node }));
  }

  updateNode(id: string, updates: Partial<WorkflowNode>): void {
    this.store.dispatch(WorkflowActions.updateNode({ id, updates }));
  }

  deleteNode(id: string): void {
    this.store.dispatch(WorkflowActions.deleteNode({ id }));
  }

  addEdge(edge: WorkflowEdge): void {
    this.store.dispatch(WorkflowActions.addEdge({ edge }));
  }

  deleteEdge(id: string): void {
    this.store.dispatch(WorkflowActions.deleteEdge({ id }));
  }

  updateNodes(nodes: WorkflowNode[]): void {
    this.store.dispatch(WorkflowActions.updateNodes({ nodes }));
  }

  updateEdges(edges: WorkflowEdge[]): void {
    this.store.dispatch(WorkflowActions.updateEdges({ edges }));
  }

  reset(): void {
    this.store.dispatch(WorkflowActions.reset());
  }
}

