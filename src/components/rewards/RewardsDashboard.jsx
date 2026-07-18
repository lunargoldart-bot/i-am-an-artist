import React, { useState, useEffect } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Star, Coins, BookOpen, Gift, TrendingUp, Award, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RewardsDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  // Check authentication
  useEffect(() => {
    firebaseClient.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await firebaseClient.auth.me();
        setUser(me);
      }
    });
  }, []);

  // Fetch user progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ["user-progress", user?.email],
    queryFn: async () => {
      const data = await firebaseClient.entities.UserProgress.filter({ user_email: user.email });
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: () => firebaseClient.entities.Badge.list(),
  });

  // Fetch tutorials
  const { data: tutorials = [] } = useQuery({
    queryKey: ["tutorials"],
    queryFn: () => firebaseClient.entities.Tutorial.list(),
  });

  // Track daily login
  const loginMutation = useMutation({
    mutationFn: () => firebaseClient.functions.invoke("trackUserProgress", { action: "daily_login" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    },
  });

  // Handle daily check-in
  const handleDailyCheckIn = () => {
    loginMutation.mutate();
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view your rewards</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentProgress = progress || {
    login_streak: 0,
    loyalty_points: 0,
    cashback_balance: 0,
    level: 1,
    xp: 0,
    badges_earned: [],
    tutorial_access_level: "basic",
  };

  const xpProgress = (currentProgress.xp % 500) / 500 * 100;
  const earnedBadges = badges.filter(b => currentProgress.badges_earned?.includes(b.badge_id));
  const availableTutorials = tutorials.filter(t => {
    const levels = { basic: 0, premium: 1, vip: 2 };
    return levels[t.access_level] <= levels[currentProgress.tutorial_access_level];
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-playfair text-3xl font-bold mb-2">Your Rewards</h1>
        <p className="text-muted-foreground">Track your progress and unlock exclusive benefits</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">{currentProgress.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">{currentProgress.loyalty_points}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">ZMW {currentProgress.cashback_balance.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Cashback</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">{earnedBadges.length}</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tutorials">Learn</TabsTrigger>
          <TabsTrigger value="badges">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Check-in */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">
                    Current streak: <span className="font-bold text-primary">{currentProgress.login_streak} days</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Earn up to 100 points for maintaining your streak!
                  </p>
                </div>
                <Button 
                  onClick={handleDailyCheckIn}
                  disabled={loginMutation.isPending}
                  className="gap-2"
                >
                  {loginMutation.isPending ? "Checking in..." : "Check In"}
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Level {currentProgress.level}</span>
                <span className="text-sm text-muted-foreground">
                  {currentProgress.xp % 500} / 500 XP
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Level {currentProgress.level + 1} unlocks: {currentProgress.level >= 2 ? "Premium tutorials" : "More badges & rewards"}
              </p>
            </CardContent>
          </Card>

          {/* How to Earn */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Daily login: 10-100 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <span>Purchase: 1 pt per 10 ZMW</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Complete tutorial: 25 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <span>Upload artwork: 50 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden">
                <div className="aspect-video bg-secondary relative">
                  {tutorial.thumbnail_url && (
                    <img 
                      src={tutorial.thumbnail_url} 
                      alt={tutorial.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Badge className="absolute top-2 right-2">
                    {tutorial.access_level}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tutorial.duration_minutes} min</span>
                    <span className="capitalize">{tutorial.content_type}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {availableTutorials.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tutorials available yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const isEarned = currentProgress.badges_earned?.includes(badge.badge_id);
              return (
                <Card 
                  key={badge.badge_id}
                  className={`text-center p-4 ${!isEarned ? 'opacity-50 grayscale' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    {!isEarned && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>Requires: {badge.requirement_value} {badge.requirement_type.replace('_', ' ')}</span>
                      </div>
                    )}
                    {isEarned && badge.points_reward > 0 && (
                      <Badge className="mt-2">+{badge.points_reward} pts</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}