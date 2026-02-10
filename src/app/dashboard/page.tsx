'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import Link from 'next/link';

type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
};

type Question = {
  id: string;
  question_text: string;
  helper_text: string | null;
};

type Answer = {
  id: string;
  question_id: string;
  answer_text: string | null;
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

type Notice = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<Step[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'goals' | 'questions' | 'steps' | 'notices'>('goals');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);

      // Get or create profile
      const { data: profileData, error: profileError } = await insforge.database
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        setError('Failed to load profile.');
        setLoading(false);
        return;
      }

      let currentProfileId = profileData?.id as string | undefined;

      if (!currentProfileId) {
        const { data: createdProfile, error: createError } = await insforge.database
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.profile?.name ?? user.email,
          })
          .select('id')
          .maybeSingle();

        if (createError || !createdProfile) {
          console.error(createError);
          setError('Could not create profile.');
          setLoading(false);
          return;
        }
        currentProfileId = createdProfile.id as string;
      }

      setProfileId(currentProfileId);

      // Load goals
      const { data: goalsData, error: goalsError } = await insforge.database
        .from('goals')
        .select('id,title,description,target_date,status')
        .eq('user_id', currentProfileId)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error(goalsError);
      } else {
        setGoals((goalsData || []) as Goal[]);
        if (goalsData && goalsData.length > 0 && !selectedGoal) {
          setSelectedGoal(goalsData[0].id as string);
        }
      }

      // Load questions
      const { data: questionsData, error: questionsError } = await insforge.database
        .from('intake_questions')
        .select('id,question_text,helper_text')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (questionsError) {
        console.error(questionsError);
      } else {
        setQuestions((questionsData || []) as Question[]);
      }

      // Load existing answers
      const { data: answersData, error: answersError } = await insforge.database
        .from('user_question_answers')
        .select('id,question_id,answer_text')
        .eq('user_id', currentProfileId);

      if (!answersError && answersData) {
        const answersMap: Record<string, string> = {};
        (answersData as Answer[]).forEach((a) => {
          answersMap[a.question_id] = a.answer_text || '';
        });
        setAnswers(answersMap);
      }

      // Load notices
      const { data: noticesData, error: noticesError } = await insforge.database
        .from('notices')
        .select('id,title,message,is_read,created_at')
        .eq('user_id', currentProfileId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!noticesError && noticesData) {
        setNotices((noticesData || []) as Notice[]);
        setUnreadNotices((noticesData as Notice[]).filter((n) => !n.is_read).length);
      }

      setLoading(false);
    };

    loadData();
  }, [user, selectedGoal]);

  useEffect(() => {
    if (!selectedGoal || !profileId) return;

    const loadSteps = async () => {
      const { data, error } = await insforge.database
        .from('goal_steps')
        .select('id,goal_id,title,description,due_date,status,order_index')
        .eq('goal_id', selectedGoal)
        .order('order_index', { ascending: true });

      if (!error && data) {
        setSteps((data || []) as Step[]);
      }
    };

    loadSteps();
  }, [selectedGoal, profileId]);

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return;
    }

    setCreating(true);
    setError(null);

    const { data: goal, error: goalError } = await insforge.database
      .from('goals')
      .insert({
        user_id: profileId,
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
      })
      .select('id,title,description,target_date,status')
      .maybeSingle();

    if (goalError || !goal) {
      console.error(goalError);
      setError('Failed to create goal.');
    } else {
      setGoals((prev) => [goal as Goal, ...prev]);
      setSelectedGoal(goal.id as string);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setActiveTab('questions');
    }

    setCreating(false);
  };

  const submitAnswers = async () => {
    if (!profileId) return;
    setSubmittingAnswers(true);
    setError(null);

    try {
      const answerEntries = Object.entries(answers).filter(([_, value]) => value.trim());

      if (answerEntries.length === 0) {
        setError('Please answer at least one question.');
        setSubmittingAnswers(false);
        return;
      }

      // Delete existing answers
      await insforge.database.from('user_question_answers').delete().eq('user_id', profileId);

      // Insert new answers
      const answersToInsert = answerEntries.map(([questionId, answerText]) => ({
        user_id: profileId,
        question_id: questionId,
        answer_text: answerText.trim(),
      }));

      const { error: insertError } = await insforge.database
        .from('user_question_answers')
        .insert(answersToInsert);

      if (insertError) {
        console.error(insertError);
        setError('Failed to save answers.');
      } else {
        setError(null);
        alert('Your answers have been saved! Your consultant will review them and create your personalized plan.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving answers.');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const markNoticeRead = async (noticeId: string) => {
    const { error } = await insforge.database
      .from('notices')
      .update({ is_read: true })
      .eq('id', noticeId);

    if (!error) {
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, is_read: true } : n))
      );
      setUnreadNotices((prev) => Math.max(0, prev - 1));
    }
  };

  const toggleStepStatus = async (stepId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : currentStatus === 'pending' ? 'in_progress' : 'done';
    const { error } = await insforge.database
      .from('goal_steps')
      .update({
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', stepId);

    if (!error) {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: newStatus } : s))
      );
    }
  };

  if (!isLoaded || loading) {
    return <div className="text-sm text-slate-500">Loading your dashboard…</div>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        Please sign in to access your goal dashboard.
      </div>
    );
  }

  const selectedGoalData = goals.find((g) => g.id === selectedGoal);
  const completedSteps = steps.filter((s) => s.status === 'done').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <div className="space-y-6 my-8 mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Your Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Manage your goals, answer questions, and track your progress.
          </p>
        </div>
        {unreadNotices > 0 && (
          <Link
            href="#notices"
            onClick={() => setActiveTab('notices')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {unreadNotices} New Notice{unreadNotices > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-4">
          {(['goals', 'questions', 'steps', 'notices'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-2 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tab}
              {tab === 'notices' && unreadNotices > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {unreadNotices}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)]">
          <form
            onSubmit={createGoal}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Set a new goal
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Goal title <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Start a profitable online business in 12 months"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Short description</label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Share context about your current situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Target date</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Save goal'}
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Your goals
            </h2>
            {goals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No goals yet. Create one to get started.
              </div>
            ) : (
              <ul className="space-y-3">
                {goals.map((goal) => (
                  <li
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal.id);
                      setActiveTab('steps');
                    }}
                    className={`cursor-pointer rounded-lg border p-4 text-sm shadow-sm transition ${
                      selectedGoal === goal.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{goal.title}</p>
                        {goal.description && (
                          <p className="mt-1 text-xs text-slate-600">{goal.description}</p>
                        )}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                        {goal.status}
                      </span>
                    </div>
                    {goal.target_date && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Intake Questions
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Please answer these questions to help your consultant understand your situation and
            create a personalized plan.
          </p>
          {questions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No questions available. Your consultant will add questions soon.
            </p>
          ) : (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    {q.question_text}
                  </label>
                  {q.helper_text && (
                    <p className="text-xs text-slate-500">{q.helper_text}</p>
                  )}
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    rows={3}
                    placeholder="Your answer..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                </div>
              ))}
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button
                onClick={submitAnswers}
                disabled={submittingAnswers}
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingAnswers ? 'Saving…' : 'Save Answers'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          {!selectedGoalData ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              Select a goal to view its steps.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedGoalData.title}
                    </h3>
                    {selectedGoalData.description && (
                      <p className="mt-1 text-sm text-slate-600">{selectedGoalData.description}</p>
                    )}
                  </div>
                </div>
                {steps.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Progress</span>
                      <span className="text-slate-600">
                        {completedSteps} of {steps.length} completed
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {steps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
                  Your consultant hasn&apos;t created steps for this goal yet. They will appear here
                  once your plan is ready.
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`rounded-lg border p-4 ${
                        step.status === 'done'
                          ? 'border-emerald-200 bg-emerald-50'
                          : step.status === 'in_progress'
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleStepStatus(step.id, step.status)}
                          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                            step.status === 'done'
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {step.status === 'done' && (
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{step.title}</p>
                              {step.description && (
                                <p className="mt-1 text-xs text-slate-600">{step.description}</p>
                              )}
                            </div>
                            <span
                              className={`ml-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase ${
                                step.status === 'done'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : step.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {step.status.replace('_', ' ')}
                            </span>
                          </div>
                          {step.due_date && (
                            <p className="mt-2 text-[11px] text-slate-500">
                              Due: {new Date(step.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No notices yet.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`rounded-lg border p-4 ${
                  notice.is_read
                    ? 'border-slate-200 bg-white'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{notice.title}</h3>
                      {!notice.is_read && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{notice.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(notice.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notice.is_read && (
                    <button
                      onClick={() => markNoticeRead(notice.id)}
                      className="ml-4 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
