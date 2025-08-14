"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
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
  Users,
  MessageSquare,
  ShoppingBag,
  Search,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Crown,
  Star,
  UserCheck,
  UserPlus,
  Calendar,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";




const reportedContent = [
  {
    id: 1,
    type: "message",
    content: "Inappropriate message content",
    reporter: "Anonymous",
    reported: "John Doe",
    status: "pending",
    date: "2024-03-12",
  },
  {
    id: 2,
    type: "listing",
    content: "Fake marketplace listing",
    reporter: "Sarah J.",
    reported: "Mike D.",
    status: "resolved",
    date: "2024-03-10",
  },
];

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any>([]);
  const [leaders, setLeaders] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [allUsers, setAllUsers] = useState<any>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isAppointDialogOpen, setIsAppointDialogOpen] = useState(false);
  const [communities, setCommunities] = useState<any>([]);
  const [appointmentData, setAppointmentData] = useState({
    student_id: "",
    title: "",
    community_id: "",
    level: ""
  });
  const [isAppointing, setIsAppointing] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] =
    useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("academic");
  const router = useRouter();

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

  const getPositionApplications = async () => {
    const { data, error } = await supabase
      .from("member_positions")
      .select(`
        *,
        community:communities(name),
        applicant:profiles(id, full_name, student_id, profile_pic)
      `)
      .eq("approved", false)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setApplications(data || []);
    }
  };

  const getApprovedLeaders = async () => {
    const { data, error } = await supabase
      .from("member_positions")
      .select(`
        *,
        community:communities(name),
        leader:profiles(id, full_name, student_id, profile_pic)
      `)
      .eq("approved", true)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setLeaders(data || []);
    }
  };

  const getUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4);
      
    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
    }
  };

  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setAllUsers(data || []);
    }
  };

  const getCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("id, name")
      .order("name", { ascending: true });
      
    if (error) {
      console.error(error);
    } else {
      setCommunities(data || []);
    }
  };

  const getAdminStats = async () => {
    const { data, error } = await supabase
      .from("admin_stats")
      .select("*")
      .single();
      
    if (error) {
      console.error(error);
    } else {
      setAdminStats(data);
    }
  };

  useEffect(() => {
    getUserProfile();
    getPositionApplications();
    getApprovedLeaders();
    getUsers();
    getCommunities();
    getAdminStats();
  }, []);

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }



  const handleApplicationAction = async (
    applicationId: number,
    action: "approve" | "reject"
  ) => {
    if (action === "approve") {
      const { error } = await supabase
        .from("member_positions")
        .update({ approved: true })
        .eq("id", applicationId);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("member_positions")
        .delete()
        .eq("id", applicationId);

      if (error) {
        console.error(error);
        return;
      }
    }

    setApplications(
      applications.filter((app: any) => app.id !== applicationId)
    );
    
    if (action === "approve") {
      getApprovedLeaders();
    }
  };

  const handleRemoveLeader = (leaderId: number) => {
    setLeaders(leaders.filter((leader: any) => leader.id !== leaderId));
  };

  const handleAppointLeader = async () => {
    if (!appointmentData.student_id.trim()) {
      setAppointmentError("Student ID is required");
      return;
    }
    if (!appointmentData.title.trim()) {
      setAppointmentError("Position title is required");
      return;
    }
    if (!appointmentData.community_id) {
      setAppointmentError("Please select a community");
      return;
    }
    if (!appointmentData.level) {
      setAppointmentError("Please select a leadership level");
      return;
    }

    setIsAppointing(true);
    setAppointmentError("");

    // Find user by student_id
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("student_id", appointmentData.student_id)
      .single();

    if (userError || !userData) {
      setAppointmentError("Student not found");
      setIsAppointing(false);
      return;
    }

    const { error } = await supabase.from("member_positions").insert({
      community_id: appointmentData.community_id,
      title: appointmentData.title,
      level: appointmentData.level,
      reason: "Directly appointed by admin",
      user_id: userData.id,
      approved: true
    });

    if (error) {
      setAppointmentError(error.message);
      setIsAppointing(false);
      return;
    }

    setIsAppointing(false);
    setAppointmentData({ student_id: "", title: "", community_id: "", level: "" });
    setIsAppointDialogOpen(false);
    getApprovedLeaders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const handleCreateAnnouncement = async () => {
    const { error } = await supabase.from("announcements").insert({
      title: announcementTitle,
      content: announcementContent,
      priority: announcementPriority,
    });

    if (error) {
      console.error("Error creating announcement:", error);
      return;
    }

    // Reset form and close dialog
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setAnnouncementPriority("normal");
    setIsAnnouncementDialogOpen(false);
  };

  const handleCreateEvent = async () => {
    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      type: eventType,
    });

    if (error) {
      console.error("Error creating event:", error);
      return;
    }

    // Reset form and close dialog
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventType("academic");
    setIsEventDialogOpen(false);
  };

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage users, content, leadership positions, and platform settings
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isEventDialogOpen}
              onOpenChange={setIsEventDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription>
                    Create a new event for the campus calendar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Title</Label>
                    <Input
                      id="eventTitle"
                      placeholder="Event title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input
                      id="eventLocation"
                      placeholder="Event location"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateEvent}
                    disabled={
                      !eventTitle.trim() ||
                      !eventDate ||
                      !eventTime ||
                      !eventLocation.trim()
                    }
                  >
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isAnnouncementDialogOpen}
              onOpenChange={setIsAnnouncementDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>
                    Send an announcement to all users on the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your announcement here..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={announcementPriority}
                      onValueChange={setAnnouncementPriority}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateAnnouncement}
                    disabled={
                      !announcementTitle.trim() || !announcementContent.trim()
                    }
                  >
                    Create Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats && [
            {
              title: "Total Users",
              value: adminStats.total_users,
              icon: Users,
              color: "text-blue-600",
            },
            {
              title: "Lost & Found Items",
              value: adminStats.lost_found_items,
              icon: Search,
              color: "text-green-600",
            },
            {
              title: "Marketplace Items",
              value: adminStats.marketplace_items,
              icon: ShoppingBag,
              color: "text-purple-600",
            },
            {
              title: "Leadership Applications",
              value: adminStats.leadership_applications,
              icon: Crown,
              color: "text-orange-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="content">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage student accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((userData: any) => (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {userData.profile_pic ? (
                            <img
                              src={userData.profile_pic}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              {userData.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{userData.full_name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {userData.student_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(userData.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          active
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setIsUserDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => {
                    getAllUsers();
                    setIsUsersDialogOpen(true);
                  }}
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leadership" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Student Leaders</CardTitle>
                  <CardDescription>
                    Manage appointed student leadership positions
                  </CardDescription>
                </div>
                <Dialog
                  open={isAppointDialogOpen}
                  onOpenChange={setIsAppointDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Appoint Leader
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Appoint Student Leader</DialogTitle>
                      <DialogDescription>
                        Directly appoint a student to a leadership position
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input 
                          id="studentId" 
                          placeholder="ST001" 
                          value={appointmentData.student_id}
                          onChange={(e) => setAppointmentData({...appointmentData, student_id: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position Title</Label>
                        <Input
                          id="position"
                          placeholder="e.g., Class Representative"
                          value={appointmentData.title}
                          onChange={(e) => setAppointmentData({...appointmentData, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community">Community</Label>
                        <Select value={appointmentData.community_id} onValueChange={(value) => setAppointmentData({...appointmentData, community_id: value})}>
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
                        <Select value={appointmentData.level} onValueChange={(value) => setAppointmentData({...appointmentData, level: value})}>
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
                      {appointmentError && (
                        <p className="text-red-500 text-sm">{appointmentError}</p>
                      )}
                      <Button className="w-full" onClick={handleAppointLeader} disabled={isAppointing}>
                        {isAppointing ? "Appointing..." : "Appoint Leader"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaders.map((leader: any) => {
                    const LevelIcon = getLevelIcon(leader.level);
                    return (
                      <div key={leader.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              {leader.leader?.profile_pic ? (
                                <img
                                  src={leader.leader.profile_pic}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AvatarFallback>
                                  {leader.leader?.full_name?.charAt(0) || 'L'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{leader.leader?.full_name || 'Unknown'}</h4>
                                <LevelIcon
                                  className={`h-4 w-4 ${getLevelColor(
                                    leader.level
                                  )}`}
                                />
                              </div>
                              <p className="text-sm font-medium text-primary">
                                {leader.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {leader.community?.name || 'Unknown Community'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Appointed: {new Date(leader.created_at).toLocaleDateString()} •{" "}
                                {leader.leader?.student_id || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveLeader(leader.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {leader.community?.name || 'Unknown Community'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {leaders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved leaders yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leadership Applications</CardTitle>
                <CardDescription>
                  Review and approve student leadership applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application: any) => {
                    const LevelIcon = getLevelIcon(application.level);
                    return (
                      <div
                        key={application.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              {application.applicant?.profile_pic ? (
                                <img
                                  src={application.applicant.profile_pic}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AvatarFallback>
                                  {application.applicant?.full_name?.charAt(
                                    0
                                  ) || "U"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">
                                  {application.applicant?.full_name ||
                                    "Unknown"}
                                </h4>
                                <LevelIcon
                                  className={`h-4 w-4 ${getLevelColor(
                                    application.level
                                  )}`}
                                />
                              </div>
                              <p className="text-sm font-medium text-primary">
                                {application.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {application.community?.name ||
                                  "Unknown Community"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Applied:{" "}
                                {new Date(
                                  application.created_at
                                ).toLocaleDateString()}{" "}
                                • {application.applicant?.student_id || "N/A"}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            pending
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {application.reason}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApplicationAction(application.id, "approve")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApplicationAction(application.id, "reject")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending applications
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>
                  Review and moderate reported content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportedContent.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{report.content}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reporter} • Against{" "}
                            {report.reported}
                          </p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure authentication and security policies
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Security
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Content Policies</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set community guidelines and content moderation rules
                    </p>
                    <Button variant="outline" size="sm">
                      Edit Policies
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Leadership Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure leadership application process and permissions
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Leadership
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">System Maintenance</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Schedule maintenance and manage system updates
                    </p>
                    <Button variant="outline" size="sm">
                      System Tools
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All Users Dialog */}
        <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>All Users</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {allUsers
                  .filter((userData: any) => 
                    userData.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    userData.student_id?.toLowerCase().includes(userSearchTerm.toLowerCase())
                  )
                  .map((userData: any) => (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {userData.profile_pic ? (
                            <img
                              src={userData.profile_pic}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              {userData.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{userData.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{userData.student_id}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(userData);
                          setIsUserDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                }
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Detail Dialog */}
        <Dialog open={isUserDetailDialogOpen} onOpenChange={setIsUserDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    {selectedUser.profile_pic ? (
                      <img
                        src={selectedUser.profile_pic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xl">
                        {selectedUser.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                    <p className="text-muted-foreground">{selectedUser.student_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm">{selectedUser.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Major</Label>
                    <p className="text-sm">{selectedUser.major || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Year</Label>
                    <p className="text-sm">{selectedUser.year || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Joined</Label>
                    <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedUser.bio && (
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm mt-1">{selectedUser.bio}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}
