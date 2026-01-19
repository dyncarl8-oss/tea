import React from 'react';
import { Users, Package, FileText, Settings, Plus } from 'lucide-react';
import { Symptom } from '../types';
import api from '../services/api';

export const AdminPanel: React.FC = () => {
    const [stats, setStats] = React.useState<any>(null);
    const [symptoms, setSymptoms] = React.useState<Symptom[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, symptomsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/symptoms')
                ]);
                setStats(statsRes.data);
                setSymptoms(symptomsRes.data);
            } catch (e) {
                console.error("Admin data fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-20 text-center text-stone-400">Loading admin metrics...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif text-brand-dark">Admin Dashboard</h2>
                    <p className="text-stone-600">Manage products, content, and platform settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-brand-dark text-white rounded-lg"><Users className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold uppercase">Total Users</p>
                        <p className="text-xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-brand-light text-white rounded-lg"><Package className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold uppercase">Products</p>
                        <p className="text-xl font-bold">{stats?.activeProducts || 0} Active</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-dark">Symptom Mappings</h3>
                    <button className="flex items-center gap-2 text-sm bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-brand-primary">
                        <Plus className="h-4 w-4" /> Add Mapping
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-500 text-sm">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Symptom</th>
                            <th className="px-6 py-3 font-semibold">Primary Recommendation</th>
                            <th className="px-6 py-3 font-semibold">Category</th>
                            <th className="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                        {symptoms.map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 font-medium text-stone-800">{s.name}</td>
                                <td className="px-6 py-4 text-brand-primary">
                                    {(s as any).recommendedProductIds?.length > 0 ? 'Assigned' : 'None'}
                                </td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{s.category}</span></td>
                                <td className="px-6 py-4 text-right text-stone-400 hover:text-brand-dark cursor-pointer"><Settings className="h-4 w-4 ml-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-dark">Campaigns & Content</h3>
                    <button className="flex items-center gap-2 text-sm bg-brand-light text-white px-3 py-1.5 rounded-lg hover:bg-brand-primary">
                        <FileText className="h-4 w-4" /> New Asset
                    </button>
                </div>
                <div className="p-6 text-center text-stone-500 italic">
                    Campaign management tools enabled for Super Admin only.
                </div>
            </div>
        </div>
    );
};