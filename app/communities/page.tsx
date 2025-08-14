"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  Plus,
  MessageSquare,
  Calendar,
  BookOpen,
  GraduationCap,
  Building,
  Star,
  TrendingUp,
  Clock,
  Pin,
  Crown,
  UserCheck,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import supabase from "@/lib/supabase";

// const communities = [
//   {
//     id: 1,
//     name: "Computer Science Department",
//     type: "department",
//     faculty: "Engineering & Technology",
//     description:
//       "Connect with fellow CS students, share projects, discuss coursework, and collaborate on coding challenges.",
//     members: 342,
//     posts: 1247,
//     isJoined: true,
//     isPrivate: false,
//     moderators: ["Dr. Smith", "Prof. Johnson"],
//     leaders: [
//       {
//         name: "Sarah Johnson",
//         position: "CS President",
//         level: "president",
//         studentId: "ST002",
//       },
//     ],
//     recentActivity: "2 min ago",
//     tags: ["Programming", "Algorithms", "Software Engineering"],
//     avatar: "CS",
//     canManage: false,
//   },
//   {
//     id: 2,
//     name: "Business Administration",
//     type: "department",
//     faculty: "Business & Economics",
//     description:
//       "Business students networking, case study discussions, internship opportunities, and career guidance.",
//     members: 289,
//     posts: 856,
//     isJoined: false,
//     isPrivate: false,
//     moderators: ["Prof. Williams", "Dr. Brown"],
//     leaders: [
//       {
//         name: "Mike Davis",
//         position: "Business Rep",
//         level: "representative",
//         studentId: "ST003",
//       },
//     ],
//     recentActivity: "15 min ago",
//     tags: ["Marketing", "Finance", "Entrepreneurship"],
//     avatar: "BA",
//     canManage: false,
//   },
//   {
//     id: 3,
//     name: "Engineering Faculty",
//     type: "faculty",
//     faculty: "Engineering & Technology",
//     description:
//       "All engineering students united! Share resources, discuss projects, and collaborate across departments.",
//     members: 1247,
//     posts: 3421,
//     isJoined: true,
//     isPrivate: false,
//     moderators: ["Dean Anderson", "Prof. Davis"],
//     leaders: [
//       {
//         name: "David Kim",
//         position: "Engineering President",
//         level: "president",
//         studentId: "ST007",
//       },
//     ],
//     recentActivity: "5 min ago",
//     tags: ["Innovation", "Projects", "Research"],
//     avatar: "EF",
//     canManage: true, // User is a president of this community
//   },
//   {
//     id: 4,
//     name: "Psychology Department",
//     type: "department",
//     faculty: "Social Sciences",
//     description:
//       "Psychology students sharing research, discussing theories, and supporting each other through studies.",
//     members: 156,
//     posts: 423,
//     isJoined: false,
//     isPrivate: false,
//     moderators: ["Dr. Wilson", "Prof. Taylor"],
//     leaders: [],
//     recentActivity: "1 hour ago",
//     tags: ["Research", "Mental Health", "Cognitive Science"],
//     avatar: "PS",
//     canManage: false,
//   },
//   {
//     id: 5,
//     name: "Medical College",
//     type: "college",
//     faculty: "Health Sciences",
//     description:
//       "Future doctors and healthcare professionals. Share study materials, discuss cases, and support each other.",
//     members: 567,
//     posts: 1892,
//     isJoined: false,
//     isPrivate: true,
//     moderators: ["Dr. Garcia", "Prof. Martinez"],
//     leaders: [
//       {
//         name: "Lisa Chen",
//         position: "Medical Secretary",
//         level: "secretary",
//         studentId: "ST006",
//       },
//     ],
//     recentActivity: "30 min ago",
//     tags: ["Medicine", "Healthcare", "Clinical Studies"],
//     avatar: "MC",
//     canManage: false,
//   },
//   {
//     id: 6,
//     name: "Mathematics Department",
//     type: "department",
//     faculty: "Sciences",
//     description:
//       "Math enthusiasts solving problems together, sharing proofs, and discussing mathematical concepts.",
//     members: 198,
//     posts: 634,
//     isJoined: true,
//     isPrivate: false,
//     moderators: ["Prof. Lee", "Dr. Chen"],
//     leaders: [],
//     recentActivity: "45 min ago",
//     tags: ["Calculus", "Statistics", "Pure Mathematics"],
//     avatar: "MA",
//     canManage: false,
//   },
//   {
//     id: 7,
//     name: "Arts & Literature Faculty",
//     type: "faculty",
//     faculty: "Arts & Humanities",
//     description:
//       "Creative minds unite! Share your work, discuss literature, and explore artistic expressions.",
//     members: 423,
//     posts: 1156,
//     isJoined: false,
//     isPrivate: false,
//     moderators: ["Prof. Thompson", "Dr. White"],
//     leaders: [],
//     recentActivity: "20 min ago",
//     tags: ["Creative Writing", "Art History", "Literature"],
//     avatar: "AL",
//     canManage: false,
//   },
//   {
//     id: 8,
//     name: "International Students",
//     type: "special",
//     faculty: "Cross-Faculty",
//     description:
//       "International students supporting each other, sharing cultural experiences, and navigating campus life.",
//     members: 234,
//     posts: 567,
//     isJoined: false,
//     isPrivate: false,
//     moderators: ["International Office", "Student Council"],
//     leaders: [],
//     recentActivity: "10 min ago",
//     tags: ["Cultural Exchange", "Support", "Events"],
//     avatar: "IS",
//     canManage: false,
//   },
// ];

const recentPosts = [
  {
    id: 1,
    communityId: 1,
    communityName: "Computer Science Department",
    author: "Sarah Johnson",
    authorPosition: { title: "CS President", level: "president" },
    content:
      "Anyone working on the Data Structures assignment? I'm stuck on implementing binary trees. Would love to collaborate! 🌳",
    timestamp: "2 min ago",
    likes: 8,
    comments: 3,
    isPinned: false,
  },
  {
    id: 2,
    communityId: 3,
    communityName: "Engineering Faculty",
    author: "David Kim",
    authorPosition: { title: "Engineering President", level: "president" },
    content:
      "Reminder: Engineering Expo registration closes tomorrow! Don't miss the chance to showcase your projects. 🚀",
    timestamp: "15 min ago",
    likes: 23,
    comments: 7,
    isPinned: true,
  },
  {
    id: 3,
    communityId: 6,
    communityName: "Mathematics Department",
    author: "Emma Wilson",
    authorPosition: null,
    content:
      "Found this amazing proof for the Pythagorean theorem using geometric algebra. Sharing the PDF in comments! 📐",
    timestamp: "45 min ago",
    likes: 15,
    comments: 12,
    isPinned: false,
  },
];

export default function CommunitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [manageCommunityId, setManageCommunityId] = useState<number | null>(
    null
  );
  const [positionApplication, setPositionApplication] = useState({
    title: "",
    community_id: "",
    level: "",
    reason: ""
  });
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [creatingCommunityError, setCreatingCommunityError] = useState("");
  const [communities, setCommunities] = useState<any>([]);

  const [newCommunity, setNewCommunity] = useState<{
    name: string;
    type: string;
    description: string;
    tags: string;
    parent: string | null;
  }>({
    name: "",
    type: "special",
    description: "",
    tags: "",
    parent: null,
  });

  const communityTypes = [
    { value: "all", label: "All Communities" },
    { value: "department", label: "Departments" },
    { value: "faculty", label: "Faculties" },
    { value: "college", label: "Colleges" },
    { value: "special", label: "Special Groups" },
  ];

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      department: "bg-blue-100 text-blue-800",
      faculty: "bg-purple-100 text-purple-800",
      college: "bg-green-100 text-green-800",
      special: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "department":
        return BookOpen;
      case "faculty":
        return GraduationCap;
      case "college":
        return Building;
      case "special":
        return Star;
      default:
        return Users;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "president":
        return Crown;
      case "secretary":
        return Star;
      case "representative":
        return UserCheck;
      default:
        return Users;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "president":
        return "text-yellow-600";
      case "secretary":
        return "text-blue-600";
      case "representative":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredCommunities = communities.filter((community: any) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.parent_name?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || community.type === selectedType;
    return matchesSearch && matchesType;
  });

  const joinedCommunities = communities.filter((c: any) =>
    c.member_ids?.includes(user?.id)
  );

  const handleJoinCommunity = async (communityId: string) => {
    const commmunity = communities.find((c: any) => c.id === communityId);

    if (!commmunity) {
      console.error("Community not found");
      return;
    }

    if (commmunity?.member_ids?.includes(user.id)) {
      return;
    }

    const { data, error } = await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      return;
    }

    setCommunities(
      communities.map((c: any) =>
        c.id === communityId
          ? { ...c, member_ids: [...c.member_ids, user.id] }
          : c
      )
    );
  };

  const handleApplyForLeadership = async () => {
    if (!positionApplication.title.trim()) {
      setApplicationError("Position title is required");
      return;
    }
    if (!positionApplication.community_id) {
      setApplicationError("Please select a community");
      return;
    }
    if (!positionApplication.level) {
      setApplicationError("Please select a leadership level");
      return;
    }
    if (!positionApplication.reason.trim()) {
      setApplicationError("Please provide a reason");
      return;
    }

    setIsApplying(true);
    setApplicationError("");

    const { error } = await supabase.from("member_positions").insert({
      community_id: positionApplication.community_id,
      title: positionApplication.title,
      level: positionApplication.level,
      reason: positionApplication.reason,
      user_id: user.id
    });

    if (error) {
      setApplicationError(error.message);
      setIsApplying(false);
      return;
    }

    setIsApplying(false);
    setPositionApplication({ title: "", community_id: "", level: "", reason: "" });
    setIsApplyDialogOpen(false);
  };

  const handleCreateCommunity = async () => {
    if (newCommunity.name.trim() === "") {
      setCreatingCommunityError("Community name is required");
      return;
    } else if (newCommunity.description.trim() === "") {
      setCreatingCommunityError("Description is required");
      return;
    } else if (newCommunity.tags.trim() === "") {
      setCreatingCommunityError("Tags are required");
      return;
    }

    if (!user?.is_admin) {
      setCreatingCommunityError("You are not authorized to create a community");
      return;
    }
    setIsCreatingCommunity(true);

    const { error } = await supabase.from("communities").insert([
      {
        name: newCommunity.name,
        type: newCommunity.type,
        parent_id: newCommunity.parent,
        description: newCommunity.description,
        tags: newCommunity.tags,
      },
    ]);

    if (error) {
      setIsCreatingCommunity(false);
      setCreatingCommunityError(error.message);
      return;
    }

    setCreatingCommunityError("");
    setIsCreatingCommunity(false);
    setIsCreateDialogOpen(false);
  };

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  async function getCommunities() {
    const { data, error } = await supabase
      .from("community_details")
      .select(`
        *,
        leaders:member_positions(
          id,
          title,
          level,
          user_id,
          leader:profiles(id, full_name, student_id, profile_pic)
        )
      `);

    if (error) {
      console.error("Error:", error);
    } else {
      const formattedData = data?.map((community: any) => ({
        ...community,
        leaders: community.leaders?.filter((pos: any) => pos.approved !== false) || []
      }));
      setCommunities(formattedData);
    }
  }

  const CommunityCard = ({ community }: { community: any }) => {
    const TypeIcon = getTypeIcon(community.type);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg font-bold">
                  {community.name.charAt(0) +
                    community.name.split(" ")?.[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  {community.isPrivate && (
                    <Badge variant="secondary" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getTypeColor(community.type)}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {community.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {community.faculty}
                  </span>
                </div>

                {/* Community Leaders */}
                {community?.leaders?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {community.leaders.map((leader: any, index: number) => {
                      const LevelIcon = getLevelIcon(leader.level);
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <LevelIcon
                            className={`h-3 w-3 ${getLevelColor(leader.level)}`}
                          />
                          <span className="font-medium">{leader.leader?.full_name}</span>
                          <span className="text-muted-foreground">
                            ({leader.title})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {community.canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManageCommunityId(community.id);
                    setIsManageDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={
                  community.member_ids.includes(user?.id)
                    ? "secondary"
                    : "default"
                }
                size="sm"
                onClick={() => handleJoinCommunity(community.id)}
              >
                {community.isJoined ? "Joined" : "Join"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {community.description}
          </CardDescription>

          <div className="flex flex-wrap gap-1 mb-4">
            {community.tags.split(",").map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{community.member_count} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{community?.posts?.length} posts</span>
              </div>
            </div>
            {/* <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{community.recentActivity}</span>
            </div> */}
          </div>

          <div className="text-xs text-muted-foreground">
            <span>
              Moderated by:{" "}
              {["Dr. Cheeks", "Dr. Binks", "Dr. Pinks"].join(", ")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    getUserProfile();
    getCommunities();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
            <p className="text-muted-foreground">
              Connect with students in your department, faculty, and college
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog
              open={isApplyDialogOpen}
              onOpenChange={setIsApplyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Apply for Leadership
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Apply for Leadership Position</DialogTitle>
                  <DialogDescription>
                    Apply to become a leader in your department or faculty
                    community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position Title</Label>
                    <Input
                      id="position"
                      placeholder="e.g., CS Department President"
                      value={positionApplication.title}
                      onChange={(e) => setPositionApplication({...positionApplication, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community">Community</Label>
                    <Select value={positionApplication.community_id} onValueChange={(value) => setPositionApplication({...positionApplication, community_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select community" />
                      </SelectTrigger>
                      <SelectContent>
                        {communities.map((community: any) => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Leadership Level</Label>
                    <Select value={positionApplication.level} onValueChange={(value) => setPositionApplication({...positionApplication, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="representative">
                          Representative
                        </SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="president">President</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Why do you want this position?
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain your motivation and qualifications..."
                      rows={4}
                      value={positionApplication.reason}
                      onChange={(e) => setPositionApplication({...positionApplication, reason: e.target.value})}
                    />
                  </div>
                  {applicationError && (
                    <p className="text-red-500 text-sm">{applicationError}</p>
                  )}
                  <Button className="w-full" onClick={handleApplyForLeadership} disabled={isApplying}>
                    {isApplying ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                  <DialogDescription>
                    Start a new community for your department, club, or interest
                    group.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Photography Club"
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Community Type</Label>
                    <Select
                      defaultValue={newCommunity.type}
                      onValueChange={(value) =>
                        setNewCommunity({ ...newCommunity, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="special_group">Special Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Community</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent community" />
                      </SelectTrigger>
                      <SelectContent>
                        {communities.map((community: any) => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose and goals of this community..."
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., photography, art, creative"
                      value={newCommunity.tags}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          tags: e.target.value,
                        })
                      }
                    />
                  </div>
                  {creatingCommunityError && (
                    <p className="text-red-500">{creatingCommunityError}</p>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleCreateCommunity}
                    disabled={isCreatingCommunity}
                  >
                    {isCreatingCommunity ? "Creating..." : "Create Community"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="joined">
              My Communities ({joinedCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="feed">Recent Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {communityTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={
                      selectedType === type.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCommunities.map((community: any) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>

            {filteredCommunities.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No communities found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedCommunities.map((community: any) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>

            {joinedCommunities.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No communities joined yet
                </h3>
                <p className="text-muted-foreground">
                  Discover and join communities to connect with fellow students
                </p>
                <Button className="mt-4" onClick={() => setSelectedType("all")}>
                  Discover Communities
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {post.isPinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {post.communityName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">
                            {post.author}
                          </span>
                          {post.authorPosition && (
                            <>
                              {(() => {
                                const LevelIcon = getLevelIcon(
                                  post.authorPosition.level
                                );
                                return (
                                  <LevelIcon
                                    className={`h-3 w-3 ${getLevelColor(
                                      post.authorPosition.level
                                    )}`}
                                  />
                                );
                              })()}
                              <Badge variant="outline" className="text-xs">
                                {post.authorPosition.title}
                              </Badge>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {post.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{post.content}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{post.likes} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline">Load More Posts</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Management Dialog */}
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Community</DialogTitle>
              <DialogDescription>
                Add or remove members from your community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search students by name or ID..."
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      {user?.profile_pic ? (
                        <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback>JD</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">ST001</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Alex Brown</p>
                      <p className="text-xs text-muted-foreground">
                        ST005 • Member
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <UserMinus className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}
