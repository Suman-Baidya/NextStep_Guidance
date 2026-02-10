'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';

type Profile = {
  id: string;
  full_name: string | null;
  role: string;
  user_id: string;
};

type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
};

type Step = {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  order_index: number;
};

type Question = {
  id: string;
  question_text: string;
  helper_text: string | null;
  is_active: boolean;
  order_index: number;
};

type Answer = {
  question_id: string;
  answer_text: string | null;
  question_text: string;
};

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  order_index: number;
};

type SiteConfig = {
  id: string;
  site_name: string;
  mobile_no: string | null;
  whatsapp_no: string | null;
  address: string | null;
  email: string | null;
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, Answer[]>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'users' | 'schedules' | 'questions' | 'notices' | 'social' | 'config'
  >('users');

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [helperText, setHelperText] = useState('');
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepDueDate, setStepDueDate] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [configForm, setConfigForm] = useState({
    site_name: '',
    mobile_no: '',
    whatsapp_no: '',
    address: '',
    email: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: me, error: meError } = await insforge.database
        .from('profiles')
        .select('id,full_name,role,user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (meError || !me || (me as Profile).role !== 'admin') {
        setLoading(false);
        return;
      }

      setProfile(me as Profile);

      const [
        { data: allProfiles },
        { data: allGoals },
        { data: allQuestions },
        { data: allSocial },
        { data: config },
      ] = await Promise.all([
        insforge.database
          .from('profiles')
          .select('id,full_name,role,user_id')
          .order('created_at', { ascending: false }),
        insforge.database
          .from('goals')
          .select('id,user_id,title,description,target_date,status')
          .order('created_at', { ascending: false }),
        insforge.database
          .from('intake_questions')
          .select('id,question_text,helper_text,is_active,order_index')
          .order('order_index', { ascending: true }),
        insforge.database
          .from('social_media_links')
          .select('id,platform,url,icon_name,is_active,order_index')
          .order('order_index', { ascending: true }),
        insforge.database.from('site_config').select('*').maybeSingle(),
      ]);

      setProfiles((allProfiles || []) as Profile[]);
      setGoals((allGoals || []) as Goal[]);
      setQuestions((allQuestions || []) as Question[]);
      setSocialLinks((allSocial || []) as SocialLink[]);
      if (config) {
        setSiteConfig(config as SiteConfig);
        setConfigForm({
          site_name: (config as SiteConfig).site_name || '',
          mobile_no: (config as SiteConfig).mobile_no || '',
          whatsapp_no: (config as SiteConfig).whatsapp_no || '',
          address: (config as SiteConfig).address || '',
          email: (config as SiteConfig).email || '',
        });
      }

      // Load answers for all users
      const usersWithAnswers: Record<string, Answer[]> = {};
      for (const p of (allProfiles || []) as Profile[]) {
        const { data: answers } = await insforge.database
          .from('user_question_answers')
          .select('question_id,answer_text')
          .eq('user_id', p.id);

        if (answers && answers.length > 0) {
          usersWithAnswers[p.id] = (answers as any[]).map((a) => ({
            ...a,
            question_text:
              questions.find((q) => q.id === a.question_id)?.question_text || 'Unknown question',
          }));
        }
      }
      setUserAnswers(usersWithAnswers);

      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!selectedGoal) return;
    // Load steps for selected goal
    insforge.database
      .from('goal_steps')
      .select('id,goal_id,title,description,due_date,status,order_index')
      .eq('goal_id', selectedGoal)
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        // Steps will be displayed in the schedules tab
      });
  }, [selectedGoal]);

  const createQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    setError(null);
    const maxOrder = Math.max(...questions.map((q) => q.order_index), -1);
    const { data, error } = await insforge.database
      .from('intake_questions')
      .insert({
        question_text: questionText.trim(),
        helper_text: helperText.trim() || null,
        order_index: maxOrder + 1,
      })
      .select('id,question_text,helper_text,is_active,order_index')
      .maybeSingle();

    if (error || !data) {
      setError('Failed to create question.');
      return;
    }

    setQuestions((prev) => [...prev, data as Question].sort((a, b) => a.order_index - b.order_index));
    setQuestionText('');
    setHelperText('');
    setSuccess('Question created successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const addStep = async () => {
    if (!selectedGoal || !stepTitle.trim()) {
      setError('Please select a goal and enter a step title.');
      return;
    }

    setError(null);
    const { data: existingSteps } = await insforge.database
      .from('goal_steps')
      .select('order_index')
      .eq('goal_id', selectedGoal)
      .order('order_index', { ascending: false })
      .limit(1);

    const maxOrder = existingSteps && existingSteps.length > 0 ? (existingSteps[0] as any).order_index : -1;

    const { error } = await insforge.database.from('goal_steps').insert({
      goal_id: selectedGoal,
      title: stepTitle.trim(),
      description: stepDescription.trim() || null,
      due_date: stepDueDate || null,
      order_index: maxOrder + 1,
      status: 'pending',
    });

    if (error) {
      setError('Failed to create step.');
      return;
    }

    setStepTitle('');
    setStepDescription('');
    setStepDueDate('');
    setSuccess('Step added successfully!');
    setTimeout(() => setSuccess(null), 3000);

    // Reload goals to refresh
    const { data: updatedGoals } = await insforge.database
      .from('goals')
      .select('id,user_id,title,description,target_date,status')
      .order('created_at', { ascending: false });
    if (updatedGoals) setGoals(updatedGoals as Goal[]);
  };

  const sendNotice = async () => {
    if (!selectedUser || !noticeTitle.trim() || !noticeMessage.trim()) {
      setError('Please select a user and fill in both title and message.');
      return;
    }

    if (!profile) return;

    setError(null);
    const { error } = await insforge.database.from('notices').insert({
      user_id: selectedUser,
      admin_id: profile.id,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
    });

    if (error) {
      setError('Failed to send notice.');
      return;
    }

    setNoticeTitle('');
    setNoticeMessage('');
    setSelectedUser(null);
    setSuccess('Notice sent successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const addSocialLink = async () => {
    if (!socialPlatform.trim() || !socialUrl.trim()) {
      setError('Platform and URL are required.');
      return;
    }

    setError(null);
    const maxOrder = Math.max(...socialLinks.map((s) => s.order_index), -1);
    const { error } = await insforge.database.from('social_media_links').insert({
      platform: socialPlatform.trim(),
      url: socialUrl.trim(),
      order_index: maxOrder + 1,
      is_active: true,
    });

    if (error) {
      setError('Failed to add social link.');
      return;
    }

    setSocialPlatform('');
    setSocialUrl('');
    setSuccess('Social link added!');
    setTimeout(() => setSuccess(null), 3000);

    const { data } = await insforge.database
      .from('social_media_links')
      .select('id,platform,url,icon_name,is_active,order_index')
      .order('order_index', { ascending: true });
    if (data) setSocialLinks(data as SocialLink[]);
  };

  const updateSiteConfig = async () => {
    setError(null);
    if (!siteConfig) {
      // Create
      const { error } = await insforge.database.from('site_config').insert({
        site_name: configForm.site_name || 'NextStep Guidance',
        mobile_no: configForm.mobile_no || null,
        whatsapp_no: configForm.whatsapp_no || null,
        address: configForm.address || null,
        email: configForm.email || null,
      });
      if (error) {
        setError('Failed to save config.');
        return;
      }
    } else {
      // Update
      const { error } = await insforge.database
        .from('site_config')
        .update({
          site_name: configForm.site_name || 'NextStep Guidance',
          mobile_no: configForm.mobile_no || null,
          whatsapp_no: configForm.whatsapp_no || null,
          address: configForm.address || null,
          email: configForm.email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteConfig.id);

      if (error) {
        setError('Failed to update config.');
        return;
      }
    }

    setSuccess('Site configuration saved!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const toggleSocialActive = async (id: string, current: boolean) => {
    const { error } = await insforge.database
      .from('social_media_links')
      .update({ is_active: !current })
      .eq('id', id);

    if (!error) {
      setSocialLinks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s))
      );
    }
  };

  const deleteSocialLink = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    const { error } = await insforge.database.from('social_media_links').delete().eq('id', id);
    if (!error) {
      setSocialLinks((prev) => prev.filter((s) => s.id !== id));
      setSuccess('Social link deleted.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (!profile) return;
    
    // Prevent demoting yourself
    const targetProfile = profiles.find((p) => p.id === userId);
    if (targetProfile?.user_id === user?.id) {
      setError('You cannot change your own role.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = `Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} this user to ${newRole}?`;
    
    if (!confirm(confirmMessage)) return;

    setError(null);
    const { error } = await insforge.database
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      setError(`Failed to update user role: ${error.message}`);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    setSuccess(`User role updated to ${newRole} successfully!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  if (!isLoaded || loading) {
    return <div className="text-sm text-slate-500">Loading admin workspace…</div>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        Please sign in with an admin account.
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        You do not have admin permissions.
      </div>
    );
  }

  const userGoals = selectedUser
    ? goals.filter((g) => g.user_id === selectedUser)
    : [];
  const selectedGoalData = goals.find((g) => g.id === selectedGoal);
  const selectedUserProfile = profiles.find((p) => p.id === selectedUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Manage users, schedules, questions, and site settings.</p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {(['users', 'schedules', 'questions', 'notices', 'social', 'config'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              All Users
            </h2>
            <div className="space-y-2">
              {profiles.map((p) => {
                const userGoalsCount = goals.filter((g) => g.user_id === p.id).length;
                const answers = userAnswers[p.id] || [];
                const isCurrentUser = p.user_id === user?.id;
                
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      p.role === 'admin'
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {p.full_name || 'Unnamed'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-slate-500">(You)</span>
                          )}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                            p.role === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {userGoalsCount} goal{userGoalsCount !== 1 ? 's' : ''} • {answers.length}{' '}
                        answer{answers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCurrentUser && (
                        <button
                          onClick={() => toggleUserRole(p.id, p.role)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            p.role === 'admin'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                          title={p.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          {p.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(p.id);
                          setActiveTab('schedules');
                        }}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
              {profiles.length === 0 && (
                <p className="text-sm text-slate-500">No users found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {!selectedUser ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              Select a user from the Users tab to manage their schedules.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Manage Schedule for {selectedUserProfile?.full_name || 'User'}
                </h2>
                <div className="mb-4 space-y-2">
                  <label className="block text-xs font-medium text-slate-600">Select Goal</label>
                  <select
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    value={selectedGoal || ''}
                    onChange={(e) => setSelectedGoal(e.target.value || null)}
                  >
                    <option value="">-- Select a goal --</option>
                    {userGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGoal && (
                  <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Add Step to: {selectedGoalData?.title}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Step Title *
                        </label>
                        <input
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          value={stepTitle}
                          onChange={(e) => setStepTitle(e.target.value)}
                          placeholder="e.g., Research target market"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Due Date
                        </label>
                        <input
                          type="date"
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          value={stepDueDate}
                          onChange={(e) => setStepDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Description
                      </label>
                      <textarea
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                        rows={2}
                        value={stepDescription}
                        onChange={(e) => setStepDescription(e.target.value)}
                        placeholder="Additional details about this step..."
                      />
                    </div>
                    <button
                      onClick={addStep}
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Add Step
                    </button>
                  </div>
                )}
              </div>

              {selectedGoal && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Steps for this goal
                  </h3>
                  <div className="space-y-2">
                    {userGoals
                      .find((g) => g.id === selectedGoal)
                      ?.id && (
                        <p className="text-sm text-slate-500">
                          Steps will appear here once added. Use the form above to create steps.
                        </p>
                      )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Intake Questions
            </h2>
            <form onSubmit={createQuestion} className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Question Text *
                </label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What experience do you already have?"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Helper Text (optional)
                </label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={helperText}
                  onChange={(e) => setHelperText(e.target.value)}
                  placeholder="Guidance for users..."
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add Question
              </button>
            </form>

            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{q.question_text}</p>
                  {q.helper_text && <p className="mt-1 text-xs text-slate-600">{q.helper_text}</p>}
                  <span className="mt-2 inline-block text-[11px] uppercase tracking-wide text-emerald-600">
                    {q.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Answers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              User Answers
            </h2>
            {Object.entries(userAnswers).map(([userId, answers]) => {
              const userProfile = profiles.find((p) => p.id === userId);
              if (!answers.length) return null;
              return (
                <div key={userId} className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 font-semibold text-slate-900">
                    {userProfile?.full_name || 'Unnamed User'}
                  </p>
                  {answers.map((a, idx) => (
                    <div key={idx} className="mt-2 text-sm">
                      <p className="font-medium text-slate-700">{a.question_text}</p>
                      <p className="text-slate-600">{a.answer_text || 'No answer'}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Send Notice to User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Select User *</label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value || null)}
                >
                  <option value="">-- Select user --</option>
                  {profiles
                    .filter((p) => p.role === 'user')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || 'Unnamed'}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Title *</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Notice title..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Message *</label>
                <textarea
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  rows={4}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Your message to the user..."
                />
              </div>
              <button
                onClick={sendNotice}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Social Media Links
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSocialLink();
              }}
              className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Platform *
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    placeholder="Facebook, Twitter, Instagram..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL *</label>
                  <input
                    type="url"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add Link
              </button>
            </form>

            <div className="space-y-2">
              {socialLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{link.platform}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSocialActive(link.id, link.is_active)}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        link.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {link.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => deleteSocialLink(link.id)}
                      className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Site Config Tab */}
      {activeTab === 'config' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Site Configuration
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateSiteConfig();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Site Name *</label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                value={configForm.site_name}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, site_name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Mobile Number</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={configForm.mobile_no}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, mobile_no: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">WhatsApp Number</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  value={configForm.whatsapp_no}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, whatsapp_no: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                value={configForm.address}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                value={configForm.email}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
