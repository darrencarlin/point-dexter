"use client";

import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useUserSettings } from "@/lib/hooks/use-user-with-settings";
import { useUpdateSessionSettings } from "@/lib/hooks/convex/use-session-settings";
import { usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useSessionSettings } from "@/lib/hooks/use-session-settings";
import { useGetSession } from "@/lib/hooks/convex/use-sessions";
import { useSession } from "@/lib/auth-client";
import { getEffectiveUserId } from "@/lib/utils/user-identity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DEFAULT_SCORING_TYPE,
  SCORING_SELECT_OPTIONS,
} from "@/lib/constants/scoring";
import { ScoringType } from "@/lib/types";

export const SettingsButton = () => {
  const { settings, isLoading, updateSettings } = useUserSettings();
  const updateSessionSettings = useUpdateSessionSettings();
  const pathname = usePathname();
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeLimit, setTimeLimit] = useState<string>("300");
  const [scoringType, setScoringType] =
    useState<ScoringType>(DEFAULT_SCORING_TYPE);
  const hasSyncedRef = useRef(false);
  const { data: authSession } = useSession();

  // Extract sessionId from pathname if we're in a session page
  const sessionIdMatch = pathname?.match(/\/session\/([^/]+)/);
  const sessionId = sessionIdMatch
    ? (sessionIdMatch[1] as Id<"sessions">)
    : null;

  const session = useGetSession(sessionId ?? undefined);
  const sessionSettings = useSessionSettings(sessionId ?? undefined);
  const currentUserId = getEffectiveUserId(authSession);
  const isAdmin = session?.createdBy === currentUserId;

  // Sync admin settings to Convex when first opening settings in a session
  useEffect(() => {
    if (
      !sessionId ||
      !isAdmin ||
      !settings ||
      hasSyncedRef.current ||
      isLoading ||
      sessionSettings.isLoading
    ) {
      return;
    }

    // Check if Convex settings are default (need initial sync)
    const needsSync =
      sessionSettings.settings?.timedVoting === false &&
      sessionSettings.settings?.votingTimeLimit === 300 &&
      sessionSettings.settings?.scoringType === DEFAULT_SCORING_TYPE &&
      (settings.timedVoting ||
        settings.votingTimeLimit !== 300 ||
        settings.scoringType !== DEFAULT_SCORING_TYPE);

    if (needsSync) {
      hasSyncedRef.current = true;
      updateSessionSettings(sessionId, {
        timedVoting: settings.timedVoting,
        votingTimeLimit: settings.votingTimeLimit,
        scoringType: settings.scoringType,
      }).catch((error) => {
        console.error("Failed to sync initial settings:", error);
        hasSyncedRef.current = false;
      });
    }
  }, [
    sessionId,
    isAdmin,
    settings,
    sessionSettings.settings,
    sessionSettings.isLoading,
    isLoading,
    updateSessionSettings,
  ]);

  useEffect(() => {
    if (settings?.votingTimeLimit !== undefined) {
      setTimeLimit(settings.votingTimeLimit.toString());
    }
  }, [settings?.votingTimeLimit]);

  useEffect(() => {
    if (settings?.scoringType) {
      setScoringType(settings.scoringType);
    }
  }, [settings?.scoringType]);

  const handleTimedVotingToggle = async (checked: boolean) => {
    if (isUpdating || isLoading) return;

    setIsUpdating(true);
    try {
      // Update Neon DB (persistent storage)
      await updateSettings({ timedVoting: checked });

      // Also update Convex (real-time sync for all participants) if in a session
      if (sessionId) {
        await updateSessionSettings(sessionId, { timedVoting: checked });
      }
    } catch (error) {
      console.error("Error updating timed voting setting:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeLimitChange = (value: string) => {
    setTimeLimit(value);
  };

  const handleTimeLimitBlur = async () => {
    const numValue = parseInt(timeLimit, 10);
    if (!isNaN(numValue) && numValue > 0) {
      if (isUpdating || isLoading) return;

      setIsUpdating(true);
      try {
        // Update Neon DB (persistent storage)
        await updateSettings({ votingTimeLimit: numValue });

        // Also update Convex (real-time sync for all participants) if in a session
        if (sessionId) {
          await updateSessionSettings(sessionId, {
            votingTimeLimit: numValue,
          });
        }
      } catch (error) {
        console.error("Error updating voting time limit:", error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Reset to current setting if invalid
      if (settings?.votingTimeLimit !== undefined) {
        setTimeLimit(settings.votingTimeLimit.toString());
      }
    }
  };

  const handleScoringTypeChange = async (value: ScoringType) => {
    if (isUpdating || isLoading) return;

    setScoringType(value);

    setIsUpdating(true);
    try {
      await updateSettings({ scoringType: value });
      if (sessionId) {
        await updateSessionSettings(sessionId, { scoringType: value });
      }
    } catch (error) {
      console.error("Error updating scoring type:", error);
      setScoringType(settings?.scoringType ?? DEFAULT_SCORING_TYPE);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShowKickButtonsToggle = async (checked: boolean) => {
    if (isUpdating || isLoading || !sessionId) return;

    setIsUpdating(true);
    try {
      // Only update session settings (this is session-specific, not user default)
      await updateSessionSettings(sessionId, { showKickButtons: checked });
    } catch (error) {
      console.error("Error updating show kick buttons setting:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <div className="px-2 py-1.5 space-y-3">

        <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="timed-voting"
              className="text-sm font-normal cursor-pointer flex-1"
            >
              Timed Voting
            </Label>
            <Switch
              id="timed-voting"
              checked={settings?.timedVoting ?? false}
              onCheckedChange={handleTimedVotingToggle}
              disabled={isLoading || isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="scoring-type"
              className="text-sm font-normal cursor-pointer flex-1"
            >
              Scoring System
            </Label>
            <Select
              value={scoringType}
              onValueChange={(value) =>
                handleScoringTypeChange(value as ScoringType)
              }
              disabled={isLoading || isUpdating}
            >
              <SelectTrigger
                id="scoring-type"
                className="h-8"
                aria-label="Select scoring system"
              >
                <SelectValue
                  placeholder="Select scoring system"
                  className="text-sm"
                />
              </SelectTrigger>
              <SelectContent>
                {SCORING_SELECT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          
          {settings?.timedVoting && (
            <div className="space-y-1.5">
              <Label
                htmlFor="voting-time-limit"
                className="text-sm font-normal"
              >
                Time Limit (seconds)
              </Label>
              <Input
                id="voting-time-limit"
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => handleTimeLimitChange(e.target.value)}
                onBlur={handleTimeLimitBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                disabled={isLoading || isUpdating}
                className="h-8"
              />
            </div>
          )}
        </div>
        {sessionId && isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>User Management</DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="show-kick-buttons"
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  Show Kick Buttons
                </Label>
                <Switch
                  id="show-kick-buttons"
                  checked={sessionSettings.settings?.showKickButtons ?? true}
                  onCheckedChange={handleShowKickButtonsToggle}
                  disabled={isLoading || isUpdating || sessionSettings.isLoading || !sessionId}
                />
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
