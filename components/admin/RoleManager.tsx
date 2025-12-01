
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Shield, Plus, Check, X, Trash2, Edit } from 'lucide-react';
import { RoleDefinition } from '../../types';

export const RoleManager: React.FC = () => {
  const { roles, availablePermissions, addRole, updateRole, deleteRole, showToast } = useShop();
  const [editingRole, setEditingRole] = useState<Partial<RoleDefinition> | null>(null);

  const handleSaveRole = () => {
    if (!editingRole || !editingRole.name) {
        showToast('Role name is required', 'error');
        return;
    }

    if (editingRole.id) {
       updateRole(editingRole as RoleDefinition);
    } else {
       const newRole: RoleDefinition = {
          id: `role-${Date.now()}`,
          name: editingRole.name,
          permissions: editingRole.permissions || [],
          isSystem: false,
          description: editingRole.description || 'Custom Role'
       };
       addRole(newRole);
    }
    setEditingRole(null);
  };

  const togglePermission = (permKey: string) => {
     if (!editingRole) return;
     const currentPerms = editingRole.permissions || [];
     if (currentPerms.includes(permKey)) {
        setEditingRole({ ...editingRole, permissions: currentPerms.filter(p => p !== permKey) });
     } else {
        setEditingRole({ ...editingRole, permissions: [...currentPerms, permKey] });
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <Shield className="text-primary" size={24}/> Roles & Permissions
                </h2>
                <p className="text-sm text-gray-500">Manage user access levels across the platform.</p>
             </div>
             <button 
                onClick={() => setEditingRole({ name: '', permissions: [] })}
                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
             >
                <Plus size={18} /> New Role
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {roles.map(role => (
                <div key={role.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative group hover:border-primary transition-colors">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                          <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingRole(role)} className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                            <Edit size={16}/>
                         </button>
                         {!role.isSystem && (
                            <button onClick={() => deleteRole(role.id)} className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50">
                               <Trash2 size={16}/>
                            </button>
                         )}
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-2">
                         {role.permissions.map(perm => (
                            <span key={perm} className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">
                               {availablePermissions.find(p => p.key === perm)?.label || perm}
                            </span>
                         ))}
                      </div>
                   </div>
                   {role.isSystem && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded">SYSTEM</span>
                   )}
                </div>
             ))}
          </div>
       </div>

       {/* Edit Role Modal */}
       {editingRole && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                   {editingRole.id ? 'Edit Role' : 'Create New Role'}
                </h3>
                
                <div className="mb-6 space-y-4">
                   <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Role Name</label>
                       <input 
                          type="text" 
                          value={editingRole.name} 
                          onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                          disabled={editingRole.isSystem}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                          placeholder="e.g. Content Editor"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                       <input 
                          type="text" 
                          value={editingRole.description || ''} 
                          onChange={e => setEditingRole({...editingRole, description: e.target.value})}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                          placeholder="What can this role do?"
                       />
                   </div>
                </div>

                <div className="mb-8">
                   <label className="block text-sm font-bold text-gray-700 mb-3">Permissions</label>
                   <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {availablePermissions.map(perm => (
                         <label key={perm.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${editingRole.permissions?.includes(perm.key) ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                               {editingRole.permissions?.includes(perm.key) && <Check size={12} className="text-white"/>}
                            </div>
                            <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={editingRole.permissions?.includes(perm.key)}
                               onChange={() => togglePermission(perm.key)}
                            />
                            <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                         </label>
                      ))}
                   </div>
                </div>

                <div className="flex justify-end gap-3">
                   <button onClick={() => setEditingRole(null)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                   <button onClick={handleSaveRole} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-slate-800">Save Role</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
