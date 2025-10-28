"use client";

import { useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import SunbeamBackground from "@/components/ui/sunbeam/sunbeam-bg";
import { TeamMember, TeamMemberType } from "./team-member";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import People from "./people";
import Image from "next/image";

export type TeamName = "Core" | "Appold"; // Extensible

export default function Team() {
  const [members, setMembers] = useState<TeamMemberType[] | null>(People.Core);
  const [selectedTeam, setSelectedTeam] = useState<TeamName>("Core");
  const [selectedMember, setSelectedMember] = useState<TeamMemberType | null>(
    null
  );
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to top when switching to member detail view
  useEffect(() => {
    if (showMemberDetail) {
      window.scrollTo({ top: 500, behavior: "smooth" });
    }
  }, [showMemberDetail]);

  // Get available teams dynamically
  const availableTeams = Object.keys(People) as TeamName[];
  const currentTeamIndex = availableTeams.indexOf(selectedTeam);

  const handleTeamSelect = (team: TeamName) => {
    if (team === selectedTeam) return;

    setSelectedTeam(team);
    setMembers(People[team]);
    setSelectedMember(null);
    setShowMemberDetail(false);
  };

  const handleMemberSelect = (member: TeamMemberType) => {
    // Desktop behavior - move to position 0
    if (isClient && window.innerWidth >= 1024) {
      const memberIndex = members
        ? members.findIndex((m) => m.name === member.name)
        : -1;

      setMembers((prevMembers) => {
        if (!prevMembers || memberIndex === -1 || memberIndex === 0) {
          return prevMembers;
        }

        let newMembers = [...prevMembers];
        newMembers[memberIndex] = newMembers[0];
        newMembers[0] = member;
        return newMembers;
      });
    } else {
      // Mobile behavior - show detail view
      setSelectedMember(member);
      setShowMemberDetail(true);
    }
  };

  const handleBackToTeam = () => {
    setShowMemberDetail(false);
    setSelectedMember(null);
    // Small delay to ensure state is updated before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 500, behavior: "smooth" });
    }, 100);
  };

  const goToNextTeam = () => {
    const nextIndex = (currentTeamIndex + 1) % availableTeams.length;
    handleTeamSelect(availableTeams[nextIndex]);
  };

  const goToPrevTeam = () => {
    const prevIndex =
      currentTeamIndex === 0 ? availableTeams.length - 1 : currentTeamIndex - 1;
    handleTeamSelect(availableTeams[prevIndex]);
  };

  const getTeamDisplayName = (teamName: TeamName): string => {
    const displayNames: Record<TeamName, string> = {
      Core: "Core Team",
      Appold: "Appold Team",
    };
    return displayNames[teamName] || teamName;
  };

  let desktopSelectedMember: TeamMemberType | null = members
    ? members[0]
    : null;
  let displayMembers = members || [];

  return (
    <SunbeamBackground
      beams={[
        {
          styles: {
            content: '""',
            position: "absolute",
            left: "0",
            top: "-300px",
            width: "100%",
            height: "1600px",
            background:
              "linear-gradient(to top left, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 80%, color-mix(in srgb, hsl(var(--background)) 0%, transparent) 100%)",
            clipPath: "polygon(190% 100%, 0% 0%, 0% 35%)",
            zIndex: "-1",
            opacity: "0.3",
          },
        },
      ]}
    >
      <Section className="py-12 md:py-24 items-center text-center space-y-6">
        {/* Mobile Detail View - Conditionally Rendered Content */}
        {showMemberDetail && selectedMember ? (
          <>
            {/* Back Button */}
            <div className="mb-6 flex justify-start w-full max-w-2xl mx-auto">
              <Button
                variant="outline"
                onClick={handleBackToTeam}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to {getTeamDisplayName(selectedTeam)}
              </Button>
            </div>

            {/* Member Detail */}
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <Image
                src={selectedMember.image}
                alt={selectedMember.name}
                width={192}
                height={192}
                className={`w-48 h-48 rounded-full border-4 border-primary/20 object-cover ${
                  selectedMember.needsInversion
                    ? "dark:invert dark:brightness-50"
                    : ""
                }`}
              />
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-primary">
                  {selectedMember.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {selectedMember.role}
                </p>
                {selectedMember.description && (
                  <p className="text-gray-500 text-base">
                    {selectedMember.description}
                  </p>
                )}
                {selectedMember.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedMember.bio}
                  </p>
                )}
                {selectedMember.link && (
                  <a
                    href={selectedMember.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary hover:text-primary/80 transition-colors"
                  >
                    View Profile →
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Team View - Header with Team Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Team Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevTeam}
                  className="h-8 w-8 p-0"
                  disabled={availableTeams.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center min-w-[200px]">
                  <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">
                    {getTeamDisplayName(selectedTeam)}
                  </h1>
                  {availableTeams.length > 1 && (
                    <div className="flex items-center gap-1 mt-2">
                      {availableTeams.map((team, index) => (
                        <button
                          key={team}
                          onClick={() => handleTeamSelect(team)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            team === selectedTeam
                              ? "bg-primary w-6"
                              : "bg-primary/30 hover:bg-primary/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextTeam}
                  className="h-8 w-8 p-0"
                  disabled={availableTeams.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Desktop Left Panel - Selected Member */}
              <div className="hidden lg:flex flex-col px-12 items-center text-center space-y-4">
                {desktopSelectedMember ? (
                  <div className="flex flex-col items-center text-center p-8 bg-primary-foreground/30 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
                    <Image
                      src={desktopSelectedMember.image}
                      alt={desktopSelectedMember.name}
                      width={192}
                      height={192}
                      className={`w-48 h-48 rounded-full mb-6 border-4 border-primary/20 object-cover ${
                        desktopSelectedMember.needsInversion
                          ? "dark:invert dark:brightness-50"
                          : ""
                      }`}
                    />
                    <h2 className="text-3xl font-bold text-primary mb-2">
                      {desktopSelectedMember.name}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-4">
                      {desktopSelectedMember.role}
                    </p>
                    {desktopSelectedMember.description && (
                      <p className="text-gray-500 text-base mb-4">
                        {desktopSelectedMember.description}
                      </p>
                    )}
                    {desktopSelectedMember.bio && (
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {desktopSelectedMember.bio}
                      </p>
                    )}
                    {desktopSelectedMember.link && (
                      <a
                        href={desktopSelectedMember.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-primary hover:text-primary/80 transition-colors"
                      >
                        View Profile →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-primary-foreground/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary/20 min-h-[400px]">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Click on a team member to learn more about them
                    </p>
                  </div>
                )}
              </div>

              {/* Right Panel - Team Grid */}
              <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:col-span-2 gap-4 md:gap-6 p-4 md:p-6">
                {displayMembers
                  .filter((member) => {
                    // Only filter on client side and desktop
                    if (!isClient) return true; // Show all during SSR

                    return window.innerWidth >= 1024
                      ? member.name !== desktopSelectedMember?.name
                      : true;
                  })
                  .map((member) => (
                    <div
                      key={member.name}
                      onClick={() => handleMemberSelect(member)}
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                      <TeamMember {...member} />
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </Section>
    </SunbeamBackground>
  );
}
