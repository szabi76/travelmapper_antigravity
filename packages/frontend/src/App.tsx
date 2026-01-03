import { useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import Navbar from './components/Navbar';
import { useGraphStore } from './lib/store';
import { getNodeChildren } from './lib/api';

import LoginModal from './components/LoginModal';
import DebugConsole from './components/DebugConsole';
import NodeDetails from './components/NodeDetails';

function App() {
  const { addNodes, addEdges, nodes, setSelectedNode } = useGraphStore();


  const handleNodeClick = async (node: any) => {
    // Show Details Panel
    setSelectedNode(node);

    // Check if children loaded? We can check backend or just fetch.
    if (node.data.childrenLoaded) return; // Optimization

    console.log('Node clicked', node.id);
    try {
      const children = await getNodeChildren(node.id);

      // Layout: Simple radial or force layout placeholder.
      // ReactFlow handles positions. We need to assign `position`.
      // Basic naive layout: random position around parent.

      const parentPos = node.position;
      const radius = 300; // Increased radius for better spread

      const newNodes = children.map((child: any, index: number) => {
        const angle = (index / children.length) * 2 * Math.PI;
        return {
          id: child.id,
          type: child.type,
          position: {
            x: parentPos.x + radius * Math.cos(angle),
            y: parentPos.y + radius * Math.sin(angle),
          },
          data: {
            ...child,
            label: child.title // ReactFlow default label
          }
        };
      });

      const newEdges = children.map((child: any) => ({
        id: `e-${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        animated: true,
        style: { stroke: '#94a3b8' }
      }));

      addNodes(newNodes);
      addEdges(newEdges);

      // Mark parent loaded in local store if we want, or backend already updated it.
    } catch (e) {
      console.error('Failed to load children', e);
    }
  };

  // Create an initial demo discovery if none exists for easier testing
  useEffect(() => {
    // Only if pure dev mode or requested? 
    // Let's leave it to user interaction via Sidebar.
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <LoginModal />
      <Navbar />
      <div className="flex-1 relative w-full h-full">
        <GraphCanvas onNodeClick={handleNodeClick} />

        <NodeDetails />
        <DebugConsole />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Explore?</h2>
              <p className="text-gray-600">Use the search bar above to start your journey.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
