import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { FFlowModule, EFConnectableSide, EFConnectionBehavior, EFConnectionType } from '@foblex/flow';
import { WorkflowFacade } from './store/workflow.facade';
import { WorkflowNode, WorkflowEdge } from './store/workflow.actions';

interface FlowNode {
  key: string;
  name: string;
  position: { x: number; y: number };
  input?: string;
  outputs: string[];
  type: string;
  data?: any;
}

interface FlowConnection {
  key: string;
  from: string;
  to: string;
}

@Component({
  selector: 'app-workflow-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, FFlowModule],
  templateUrl: './workflow-editor.component.html',
  styleUrl: './workflow-editor.component.scss'
})
export class WorkflowEditorComponent implements OnInit {
  protected readonly workflowFacade = inject(WorkflowFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  nodes$ = this.workflowFacade.nodes$;
  edges$ = this.workflowFacade.edges$;

  public flow = {
    nodes: [] as any[],
    connections: [] as any[]
  };

  private workflowNodes: WorkflowNode[] = [];

  public eConnectableSide = EFConnectableSide;
  public cBehavior: EFConnectionBehavior = EFConnectionBehavior.FIXED;
  public cType: EFConnectionType = EFConnectionType.SEGMENT;

  // Connection dragging
  isConnecting = false;
  connectingFrom: string | null = null;
  connectingFromType: 'output' | 'input' | null = null;

  nodeTypes = [
    { type: 'start', label: 'Start', icon: '▶️', color: '#10b981' },
    { type: 'text', label: 'Text Node', icon: '📝', color: '#3b82f6' },
    { type: 'action', label: 'Action', icon: '⚡', color: '#f59e0b' },
    { type: 'condition', label: 'Condition', icon: '❓', color: '#ef4444' },
    { type: 'end', label: 'End', icon: '⏹️', color: '#8b5cf6' }
  ];

  ngOnInit(): void {
    this.nodes$.subscribe(nodes => {
      this.workflowNodes = nodes;
      this.updateFlowNodes(nodes);
      this.cdr.markForCheck();
    });
    this.edges$.subscribe(edges => {
      this.updateFlowConnections(edges);
      this.cdr.markForCheck();
    });

    // Initialize with a start node if empty
    this.nodes$.pipe(take(1)).subscribe((nodes: WorkflowNode[]) => {
      if (nodes.length === 0) {
        setTimeout(() => {
          this.addNode('start');
        }, 0);
      }
    });
  }

  private updateFlowNodes(workflowNodes: WorkflowNode[]): void {
    // Preserve existing positions from flow.nodes to prevent reset
    const existingNodesMap = new Map(this.flow.nodes.map(n => [n.key, n]));
    
    this.flow.nodes = workflowNodes.map(node => {
      const existingNode = existingNodesMap.get(node.id);
      // Use existing position if available and node hasn't been moved, otherwise use stored position
      const position = existingNode?.position && 
                      existingNode.position.x === node.position.x && 
                      existingNode.position.y === node.position.y
                      ? existingNode.position 
                      : { x: node.position.x, y: node.position.y };
      
      return {
        key: node.id,
        name: node.data.label || node.type,
        position: position,
        input: node.type !== 'start' ? `${node.id}-input` : undefined,
        outputs: node.type !== 'end' ? [`${node.id}-output`] : [],
        type: node.type,
        data: node.data
      };
    });
    console.log('Flow nodes updated:', this.flow.nodes.length, this.flow.nodes);
    this.cdr.detectChanges();
  }

  private updateFlowConnections(workflowEdges: WorkflowEdge[]): void {
    this.flow.connections = workflowEdges.map(edge => {
      const from = `${edge.source}-output`;
      const to = `${edge.target}-input`;
      console.log('Mapping connection:', { edge, from, to });
      return {
        key: edge.id,
        from: from,
        to: to
      };
    });
    console.log('Flow connections updated:', this.flow.connections.length, this.flow.connections);
    console.log('Available nodes for connections:', this.flow.nodes.map(n => ({
      id: n.key,
      outputs: n.outputs,
      input: n.input
    })));
    this.cdr.detectChanges();
  }

  addNode(type: string): void {
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nodeType = this.nodeTypes.find(nt => nt.type === type);
    
    const newNode: WorkflowNode = {
      id: nodeId,
      type: type as any,
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200
      },
      data: {
        label: nodeType?.label || 'Node',
        text: type === 'text' ? 'Enter text here...' : ''
      }
    };

    console.log('Adding node:', newNode);
    this.workflowFacade.addNode(newNode);
  }

  onNodeDoubleClick(node: FlowNode): void {
    // Handle node editing
    const workflowNode = this.getWorkflowNode(node.key);
    if (workflowNode) {
      const newText = prompt('Enter text:', workflowNode.data.text || workflowNode.data.label);
      if (newText !== null) {
        this.workflowFacade.updateNode(workflowNode.id, {
          data: {
            ...workflowNode.data,
            text: newText,
            label: newText || workflowNode.data.label
          }
        });
      }
    }
  }

  onNodeButtonClick(node: FlowNode): void {
    alert('taussef');
  }

  onHandleMouseDown(event: MouseEvent, handleId: string, type: 'input' | 'output', nodeKey: string): void {
    event.stopPropagation();
    event.preventDefault();
    
    if (type === 'output') {
      this.isConnecting = true;
      this.connectingFrom = handleId;
      this.connectingFromType = 'output';
      console.log('Starting connection from:', handleId);
    }
  }

  onHandleMouseUp(event: MouseEvent, handleId: string, type: 'input' | 'output', nodeKey: string): void {
    event.stopPropagation();
    event.preventDefault();
    
    if (this.isConnecting && this.connectingFromType === 'output' && type === 'input') {
      // Complete the connection
      const sourceId = this.connectingFrom!.replace('-output', '');
      const targetId = handleId.replace('-input', '');
      
      // Check if connection already exists
      const existingConnection = this.flow.connections.find(
        c => c.from === this.connectingFrom && c.to === handleId
      );
      
      if (!existingConnection && sourceId !== targetId) {
        const edgeId = `edge-${sourceId}-${targetId}-${Date.now()}`;
        const newEdge: WorkflowEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId
        };
        
            console.log('Creating connection:', newEdge);
            console.log('Connection IDs:', { from: this.connectingFrom, to: handleId });
            this.workflowFacade.addEdge(newEdge);
            
            // Force update
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
      }
    }
    
    this.isConnecting = false;
    this.connectingFrom = null;
    this.connectingFromType = null;
  }

  onConnectionRemoved(event: any): void {
    console.log('Connection removed:', event);
    if (event && event.connectionId) {
      this.workflowFacade.deleteEdge(event.connectionId);
    } else if (event && event.outputId && event.inputId) {
      // Find and remove the edge
      const edge = this.flow.connections.find(
        c => c.from === event.outputId && c.to === event.inputId
      );
      if (edge) {
        this.workflowFacade.deleteEdge(edge.key);
      }
    }
  }

  onConnectionCreated(event: any): void {
    console.log('Connection created event:', event);
    if (event) {
      let outputId: string | undefined;
      let inputId: string | undefined;
      
      // Handle different event formats
      if (event.outputId && event.inputId) {
        outputId = event.outputId;
        inputId = event.inputId;
      } else if (event.output && event.input) {
        outputId = event.output;
        inputId = event.input;
      } else if (event.from && event.to) {
        outputId = event.from;
        inputId = event.to;
      }
      
      if (outputId && inputId) {
        const sourceId = outputId.replace('-output', '');
        const targetId = inputId.replace('-input', '');
        
        // Check if nodes exist
        const sourceNode = this.workflowNodes.find(n => n.id === sourceId);
        const targetNode = this.workflowNodes.find(n => n.id === targetId);
        
        if (sourceNode && targetNode) {
          // Check if connection already exists
          const existingConnection = this.flow.connections.find(
            c => c.from === outputId && c.to === inputId
          );
          
          if (!existingConnection) {
            const edgeId = `edge-${sourceId}-${targetId}-${Date.now()}`;
            const newEdge: WorkflowEdge = {
              id: edgeId,
              source: sourceId,
              target: targetId
            };
            
            console.log('Adding edge:', newEdge);
            this.workflowFacade.addEdge(newEdge);
          }
        }
      }
    }
  }

  onNodePositionChanged(event: any): void {
    console.log('Node position changed:', event);
    if (event) {
      const nodeId = event.nodeId || event.id || event.key;
      const position = event.position || { x: event.x, y: event.y };
      
      if (nodeId && position) {
        // Update the flow node position immediately to prevent reset
        const flowNode = this.flow.nodes.find(n => n.key === nodeId);
        if (flowNode) {
          flowNode.position = position;
        }
        // Update in store
        this.workflowFacade.updateNode(nodeId, { position });
      }
    }
  }

  deleteNode(nodeKey: string): void {
    this.workflowFacade.deleteNode(nodeKey);
  }

  getNodeColor(node: FlowNode): string {
    return this.nodeTypes.find(nt => nt.type === node.type)?.color || '#6b7280';
  }

  getNodeIcon(node: FlowNode): string {
    return this.nodeTypes.find(nt => nt.type === node.type)?.icon || '📦';
  }

  private getWorkflowNode(key: string): WorkflowNode | null {
    return this.workflowNodes.find(n => n.id === key) || null;
  }

  trackByFn(index: number, item: any): any {
    return item.key || item.id || index;
  }

  getConnectionPath(connection: FlowConnection): string {
    const sourceNode = this.flow.nodes.find(n => {
      const outputId = `${n.key}-output`;
      return outputId === connection.from;
    });
    const targetNode = this.flow.nodes.find(n => {
      const inputId = `${n.key}-input`;
      return inputId === connection.to;
    });
    
    if (!sourceNode || !targetNode) {
      console.warn('Connection path: nodes not found', { connection, sourceNode, targetNode });
      return '';
    }
    
    // Node dimensions
    const nodeWidth = 150;
    const nodeHeight = 80;
    
    // Calculate handle positions
    const sourceX = sourceNode.position.x + nodeWidth;
    const sourceY = sourceNode.position.y + nodeHeight / 2;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + nodeHeight / 2;
    
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlPointOffset = Math.min(Math.abs(dx) * 0.6, Math.max(50, distance * 0.3));
    
    // Create smooth bezier curve
    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`;
  }
}
