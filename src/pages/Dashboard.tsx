import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { ParticleBackground } from '@/components/ParticleBackground';
import { LiveScoreboard } from '@/components/LiveScoreboard';
import { EventTimer } from '@/components/EventTimer';
import { ApiSubmissionForm } from '@/components/ApiSubmissionForm';
import { TeamManagement } from '@/components/TeamManagement';
import { ShortlistStatusCard } from '@/components/ShortlistStatusCard';
import EventDetails from '@/components/EventDetails';
import { Button } from '@/components/ui/button';
import db from '@/integrations/mongo/client';
import { 
  FileText, 
  Code2, 
  Trophy, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Award,
  Rocket,
  BookOpen
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  problem_statement: string | null;
  rules: string | null;
  api_contract: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  submissions_locked: boolean;
}

interface Team {
  id?: string;
  _id?: string;
  name: string;
  shortlist_status: string;
  dataset_name: string | null;
  dataset_description: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  profiles: {
    email: string;
    team_name: string | null;
  } | null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentRound, setCurrentRound] = useState<any | null>(null);
  const [qualificationStatus, setQualificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'submit' | 'scoreboard'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    console.log("AUTH USER OBJECT:", user);

    try {
      console.log('Fetching dashboard data for user:', user?.id);
      setLoading(true);
      
      // Fetch active event
      try {
        const eventRes = await fetch(`http://localhost:4000/api/events?status=active`);
        if (eventRes.ok) {
          const events = await eventRes.json();
          console.log('Events:', events);
          if (events && events.length > 0) {
            setActiveEvent(events[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }

      // Fetch user's team with full details
      // Fetch team directly (participant = team login)
if (user) {
  try {
    const teamRes = await fetch(
      `http://localhost:4000/api/teams/${user.id}`
    );

    if (teamRes.ok) {
      const team = await teamRes.json();

      const normalisedTeam: Team = {
        id: team._id,
        name: team.teamName || team.name,
        shortlist_status: team.shortlist_status || 'pending',
        dataset_name: team.dataset_name ?? null,
        dataset_description: team.dataset_description ?? null,
      };

      setUserTeam(normalisedTeam);

      // Members are embedded in team doc
      if (Array.isArray(team.members)) {
        setTeamMembers(
          team.members.map((m: any, idx: number) => ({
            id: `${idx}`,
            user_id: '',
            profiles: {
              email: m.email,
              team_name: m.name,
            },
          }))
        );
      }
    }
  } catch (err) {
    console.error('Error fetching team:', err);
  }
}

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'submit', label: 'Submit API', icon: Code2 },
    { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
  ];

  const getShortlistStatus = (): 'shortlisted' | 'not_shortlisted' | 'pending' => {
    if (!userTeam) return 'pending';
    switch (userTeam.shortlist_status) {
      case 'shortlisted': return 'shortlisted';
      case 'not_shortlisted': return 'not_shortlisted';
      default: return 'pending';
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Participant Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your competition entry here.
          </p>
        </motion.div>

        {/* Team Info & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-display font-semibold">
                {userTeam?.name || 'No team yet'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Event Status</p>
              <p className="font-display font-semibold capitalize">
                {activeEvent?.status || 'No active event'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              userTeam ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              {userTeam ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-warning" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Status</p>
              <p className="font-display font-semibold">
                {userTeam ? 'Ready to Submit' : 'Join a Team First'}
              </p>
            </div>
          </motion.div>

          {/* Shortlist Status Mini Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`glass-card p-4 flex items-center gap-4 ${
              getShortlistStatus() === 'shortlisted' 
                ? 'border-success/30' 
                : getShortlistStatus() === 'not_shortlisted'
                ? 'border-destructive/30'
                : 'border-warning/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              getShortlistStatus() === 'shortlisted' 
                ? 'bg-success/10' 
                : getShortlistStatus() === 'not_shortlisted'
                ? 'bg-destructive/10'
                : 'bg-warning/10'
            }`}>
              <Award className={`h-6 w-6 ${
                getShortlistStatus() === 'shortlisted' 
                  ? 'text-success' 
                  : getShortlistStatus() === 'not_shortlisted'
                  ? 'text-destructive'
                  : 'text-warning'
              }`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shortlist</p>
              <p className={`font-display font-semibold capitalize ${
                getShortlistStatus() === 'shortlisted' 
                  ? 'text-success' 
                  : getShortlistStatus() === 'not_shortlisted'
                  ? 'text-destructive'
                  : 'text-warning'
              }`}>
                {getShortlistStatus().replace('_', ' ')}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'overview' && (
            <>
              <div className="lg:col-span-2 space-y-6">
                {/* Team Details Card */}
                {userTeam && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Team Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Team Name</p>
                        <p className="font-semibold">{userTeam.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team ID</p>
                        <p className="font-mono text-xs">
                          {(userTeam.id || userTeam._id || '').toString().slice(0, 8) || 'N/A'}...
                        </p>
                      </div>
                    </div>
                    {userTeam.dataset_name && (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm font-medium mb-1">Assigned Dataset: {userTeam.dataset_name}</p>
                        {userTeam.dataset_description && (
                          <p className="text-xs text-muted-foreground">{userTeam.dataset_description}</p>
                        )}
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Team Members ({teamMembers.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {teamMembers.map((member) => (
                          <span
                            key={member.id}
                            className="px-3 py-1 rounded-full bg-primary/10 text-sm"
                          >
                            {member.profiles?.team_name || member.profiles?.email || 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Event Coming Soon / Event Details */}
                {activeEvent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className=""
                  >
                    <EventDetails
                      event={activeEvent}
                      currentRound={currentRound}
                      qualificationStatus={qualificationStatus}
                    />
                  </motion.div>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-display font-semibold text-lg mb-2">No Active Event</h3>
                    <p className="text-muted-foreground">
                      Check back later for upcoming competitions.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Shortlist Status Card */}
                {userTeam && (
                  <ShortlistStatusCard 
                    status={getShortlistStatus()} 
                    teamName={userTeam.name}
                  />
                )}
                
                {activeEvent && (
                  <EventTimer
                    startTime={activeEvent.start_time}
                    endTime={activeEvent.end_time}
                    status={activeEvent.status}
                  />
                )}
                <LiveScoreboard eventId={activeEvent?.id} limit={5} />
              </div>
            </>
          )}

          {activeTab === 'team' && (
            <>
              <div className="lg:col-span-2">
                <TeamManagement 
                  eventId={activeEvent?.id} 
                  onTeamChange={fetchData} 
                />
              </div>
              <div className="space-y-6">
                {userTeam && (
                  <ShortlistStatusCard 
                    status={getShortlistStatus()} 
                    teamName={userTeam.name}
                  />
                )}
                {activeEvent && (
                  <EventTimer
                    startTime={activeEvent.start_time}
                    endTime={activeEvent.end_time}
                    status={activeEvent.status}
                  />
                )}
                <LiveScoreboard eventId={activeEvent?.id} limit={5} />
              </div>
            </>
          )}

          {activeTab === 'submit' && (
            <>
              <div className="lg:col-span-2">
                {userTeam && activeEvent ? (
                  <ApiSubmissionForm
                    teamId={userTeam.id}
                    eventId={activeEvent.id}
                    isLocked={activeEvent.submissions_locked}
                  />
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Code2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {!userTeam ? 'Join a Team First' : 'No Active Event'}
                    </h3>
                    <p className="text-muted-foreground">
                      {!userTeam 
                        ? 'You need to be part of a team to submit an API.'
                        : 'There is no active event to submit to.'
                      }
                    </p>
                  </div>
                )}
              </div>
              <div>
                {activeEvent && (
                  <EventTimer
                    startTime={activeEvent.start_time}
                    endTime={activeEvent.end_time}
                    status={activeEvent.status}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === 'scoreboard' && (
            <div className="lg:col-span-3">
              <LiveScoreboard eventId={activeEvent?.id} limit={20} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
