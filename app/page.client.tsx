"use client";

import { Navigation } from "@/components/navigation";
import { Card } from "@/components/card";
import { motion } from "framer-motion";
import {
  Users,
  RefreshCw,
  Gauge,
  Clock,
  Shield,
  Eye,
  History,
  Moon,
  Sparkles,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalSessions: number;
  activeSessions: number;
  archivedSessions: number;
}

interface HomePageClientProps {
  stats: Stats | null;
}

export default function HomePageClient({ stats }: HomePageClientProps) {
  const features = [
    {
      icon: Users,
      title: "Real-Time Collaborative Story Pointing",
      description:
        "Estimate stories together with your team in real-time — fast, accurate, and transparent.",
    },
    {
      icon: RefreshCw,
      title: "Sync JIRA Issues or Add Stories Manually",
      description:
        "Import directly from JIRA or create stories by hand to fit your workflow.",
    },
    {
      icon: Gauge,
      title: "Customizable Point Scales",
      description:
        "Support for Fibonacci, T-shirt sizing, or any custom point system you prefer.",
    },
    {
      icon: Clock,
      title: "Timed Voting Rounds",
      description:
        "Keep sessions focused with configurable time limits per estimation round.",
    },
    {
      icon: Shield,
      title: "Role-Based Interfaces",
      description:
        "Separate, optimized views for admins and participants — clarity for every role.",
    },
    {
      icon: Eye,
      title: "Live Participant Presence",
      description:
        "See who’s online and actively participating in the session at any time.",
    },
    {
      icon: History,
      title: "Session History & Replay",
      description:
        "Review past sessions to analyze team consensus and estimation trends.",
    },
    {
      icon: Moon,
      title: "Light & Dark Mode Support",
      description:
        "Work comfortably in your preferred theme — automatically adapts to your system settings.",
    },
    {
      icon: Sparkles,
      title: "Consensus Celebration Effects",
      description:
        "Celebrate team consensus with a burst of confetti — a fun, visual reward for alignment.",
    },
  ];

  return (
    <>
      <Navigation />
      <main className="flex flex-col items-center px-6 py-16 sm:px-12 lg:px-24 bg-gradient-to-b from-background to-muted/30">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Point Dexter
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Collaborative story point estimation — simplified and streamlined.
          </p>
        </motion.div>

        {/* Stats Section */}
        {stats ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mb-20"
          >
            <Card className="text-center hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Sessions
              </h3>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Active Sessions
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeSessions}
              </p>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Archived Sessions
              </h3>
              <p className="text-3xl font-bold text-muted-foreground">
                {stats.archivedSessions}
              </p>
            </Card>
          </motion.div>
        ) : (
          <p className="text-muted-foreground text-sm mt-6 mb-16">
            No stats available yet.
          </p>
        )}

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl w-full"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  className="flex flex-col items-start justify-start p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </motion.section>

        {/* Summary / CTA */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-20 max-w-md text-muted-foreground"
          >
            <p className="text-base">
              Join <strong>{stats.totalUsers}</strong> user
              {stats.totalUsers !== 1 ? "s" : ""} across{" "}
              <strong>{stats.totalSessions}</strong> session
              {stats.totalSessions !== 1 ? "s" : ""}.{" "}
              {stats.activeSessions > 0 && (
                <>
                  Currently <strong>{stats.activeSessions}</strong> active
                  session
                  {stats.activeSessions !== 1 ? "s" : ""}.
                </>
              )}
            </p>
          </motion.div>
        )}
      </main>
    </>
  );
}
