import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Loader2, Trash2 } from 'lucide-react';
import ProjectModal from './ProjectModal';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', client: '', budget: '', status: 'Pending' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const created = await api.createProject(newProject);
      setProjects([...projects, created]);
      setIsModalOpen(false);
      setNewProject({ title: '', client: '', budget: '', status: 'Pending' });
    } catch (e) {
      alert('Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
    } catch (e) {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8"/></div>;

  return (
    <>
      <div className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold font-heading text-slate-900 mb-6">Manage Projects</h1>
          <button onClick={() => setIsModalOpen(true)} className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md">Create New Project</button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Budget</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(project => (
                <tr key={project._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{project.title}</td>
                  <td className="p-4 text-slate-600">{project.client?.name || 'Unknown'}</td>
                  <td className="p-4 font-bold text-slate-700">${project.budget}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] uppercase font-black tracking-wider">{project.status}</span></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(project._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={newProject}
        setProject={setNewProject}
        onSubmit={handleCreateProject}
      />
    </>
  );
};
export default AdminProjects;
