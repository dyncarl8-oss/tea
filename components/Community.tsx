import React, { useState } from 'react';
import { PlayCircle, FileText, Lock, MessageSquare, Heart } from 'lucide-react';
import api from '../services/api';

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'learn' | 'live'>('learn');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'learn') {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const res = await api.get('/content/courses');
          setCourses(res.data);
        } catch (e) {
          console.error("Failed to fetch courses", e);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Community Header */}
      {/* ... (existing header code) ... */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-stone-200">
        <div>
          <h2 className="text-3xl font-serif text-brand-dark mb-2">The Steep Circle</h2>
          <p className="text-stone-600">Deepen your knowledge and connect with the tribe.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'feed' ? 'bg-brand-primary text-white' : 'bg-transparent text-stone-600 hover:bg-stone-100'}`}
          >
            Discussion
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'learn' ? 'bg-brand-primary text-white' : 'bg-transparent text-stone-600 hover:bg-stone-100'}`}
          >
            Learning
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'live' ? 'bg-brand-primary text-white' : 'bg-transparent text-stone-600 hover:bg-stone-100'}`}
          >
            Live Events
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-stone-400">Loading resources...</div>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <div key={course._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col">
                  <div className="relative h-40">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    {course.locked && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-2">{course.category}</span>
                    <h3 className="text-lg font-bold text-brand-dark mb-1">{course.title}</h3>
                    <p className="text-sm text-stone-500 mb-4">with {course.instructor}</p>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>{course.progress || 0}% Complete</span>
                        <span>{course.lessons} Lessons</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-brand-light h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="mt-4 w-full py-2 border border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition-colors">
                      {course.locked ? 'Unlock with Pro' : (course.progress > 0 ? 'Continue' : 'Start Course')}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-stone-400">No courses found.</div>
            )}
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-brand-light rounded-full flex items-center justify-center text-white font-bold">JD</div>
                <input type="text" placeholder="Share your brew today..." className="flex-1 bg-stone-50 rounded-lg px-4 outline-none border border-transparent focus:border-brand-light" />
              </div>
            </div>

            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                <div className="flex gap-3 mb-4">
                  <img src={`https://picsum.photos/50/50?random=${i + 20}`} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-stone-800">Sarah Jenkins</h4>
                    <p className="text-xs text-stone-500">2 hours ago • Member</p>
                  </div>
                </div>
                <p className="text-stone-700 mb-4">
                  Just tried the new Digestive Flow blend after a heavy meal. It's incredible how fast the ginger kicks in! Highly recommend adding a touch of honey. 🍯
                </p>
                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <button className="flex items-center gap-1 text-stone-500 hover:text-brand-accent text-sm">
                    <Heart className="h-4 w-4" /> 12 Likes
                  </button>
                  <button className="flex items-center gap-1 text-stone-500 hover:text-brand-primary text-sm">
                    <MessageSquare className="h-4 w-4" /> 3 Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'live' && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
            <div className="h-16 w-16 bg-brand-sand rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-brand-primary" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark">Next Live Session</h3>
            <p className="text-stone-600 mt-2">"Winter Wellness Q&A" with Dr. Althea Green</p>
            <p className="text-brand-accent font-bold mt-1">Thursday, Oct 24 • 6:00 PM EST</p>
            <button className="mt-6 px-6 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-primary">
              RSVP Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};