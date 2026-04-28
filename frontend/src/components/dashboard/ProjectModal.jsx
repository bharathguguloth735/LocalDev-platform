import { useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * ProjectModal - a glassmorphism styled modal for creating a new project.
 * Props:
 *  - isOpen: boolean – controls visibility
 *  - onClose: () => void – called when modal is dismissed
 *  - project: object – current project form state
 *  - setProject: (proj) => void – state setter for form fields
 *  - onSubmit: () => void – handler to create the project
 */
export default function ProjectModal({ isOpen, onClose, project, setProject, onSubmit }) {
  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setProject({ title: '', client: '', budget: '', status: 'Pending' });
    }
  }, [isOpen, setProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background overlay with blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-white">Create New Project</Dialog.Title>
                  <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                  className="space-y-4"
                >
                  <input
                    name="title"
                    value={project.title}
                    onChange={handleChange}
                    placeholder="Project Title"
                    className="w-full rounded-md bg-white/20 backdrop-blur-sm px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <input
                    name="client"
                    value={project.client}
                    onChange={handleChange}
                    placeholder="Client Name"
                    className="w-full rounded-md bg-white/20 backdrop-blur-sm px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <input
                    name="budget"
                    type="number"
                    value={project.budget}
                    onChange={handleChange}
                    placeholder="Budget (USD)"
                    className="w-full rounded-md bg-white/20 backdrop-blur-sm px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <select
                    name="status"
                    value={project.status}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white/20 backdrop-blur-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-md bg-gray-600/30 text-gray-200 hover:bg-gray-600/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
