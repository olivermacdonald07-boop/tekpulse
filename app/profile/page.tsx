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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import supabase from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const [userStats, setUserStats] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (user && !isEditing) {
      setEditedUser({
        phone_number: user.phone_number,
        major: user.major,
        year: user.year,
        bio: user.bio,
      });
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (user) {
      userOverview();
      supabase.auth.getUser().then(({ data }) => {
        setUser({
          ...user,
          email: data.user?.email,
        });
      });
    }
  }, [user]);

  async function userOverview() {
    const { data, error } = await supabase
      .from("user_activity_summary")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setUserStats([
        { label: "Communities Joined", value: data.communities_joined },
        { label: "Items Listed", value: data.product_listings },
        { label: "Items Found", value: data.items_found },
        { label: "Posts", value: data.post_count },
      ]);
    }
  }

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !user) return;

    setIsUploading(true);

    const fileExt = selectedImage.name.split(".").pop();
    const { data: imageData, error: uploadError } = await supabase.storage
      .from("profile-pic")
      .upload(`${user.id}/${Date.now()}.${fileExt}`, selectedImage);

    if (uploadError) {
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("profile-pic")
      .getPublicUrl(imageData.path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_pic: data.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
    } else {
      setUser({ ...user, profile_pic: data.publicUrl });
    }

    setIsUploading(false);
    setSelectedImage(null);
    setImagePreview(null);
    await getUserProfile();
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        phone_number: editedUser.phone_number,
        major: editedUser.major,
        year: editedUser.year,
        bio: editedUser.bio,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
    } else {
      setUser({ ...user, ...editedUser });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      phone_number: user.phone_number,
      major: user.major,
      year: user.year,
      bio: user.bio,
    });
    setIsEditing(false);
  };

  if (!user) return null;

  const recentActivity = [
    {
      id: 1,
      type: "message",
      description: "Sent a message to Sarah Johnson",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "listing",
      description: 'Listed "Calculus Textbook" in marketplace',
      timestamp: "1 day ago",
    },
    {
      id: 3,
      type: "found",
      description: "Reported found item: Blue Backpack",
      timestamp: "3 days ago",
    },
    {
      id: 4,
      type: "message",
      description: "Received message from Mike Davis",
      timestamp: "5 days ago",
    },
  ];

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {user.full_name?.charAt(0) || user.name?.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 w-8 p-0"
                        asChild
                      >
                        <label className="cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image Preview and Upload */}
                {imagePreview && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-full mx-auto"
                    />
                    <div className="flex space-x-2 justify-center">
                      <Button
                        size="sm"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    Student ID: {user.student_id}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {userStats.map((stat: any) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={user.full_name || ""}
                          readOnly
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email || ""}
                          readOnly
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={user.student_id || ""}
                          readOnly
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={
                            isEditing
                              ? editedUser.phone_number || ""
                              : user.phone_number || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              phone_number: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="major">Major</Label>
                        <Input
                          id="major"
                          value={
                            isEditing
                              ? editedUser.major || ""
                              : user.major || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              major: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={
                            isEditing ? editedUser.year || "" : user.year || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              year: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="Junior"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={
                          isEditing ? editedUser.bio || "" : user.bio || ""
                        }
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, bio: e.target.value })
                        }
                        readOnly={!isEditing}
                        placeholder="Tell other students about yourself..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and interactions on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-3 rounded-lg border"
                        >
                          <div className="flex-shrink-0">
                            {activity.type === "message" && (
                              <Mail className="h-5 w-5 text-blue-500" />
                            )}
                            {activity.type === "listing" && (
                              <GraduationCap className="h-5 w-5 text-green-500" />
                            )}
                            {activity.type === "found" && (
                              <MapPin className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp}
                            </p>
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
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Receive email notifications for messages and important
                          updates
                        </p>
                        <Button variant="outline" size="sm">
                          Configure Notifications
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Privacy Settings</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Control who can see your profile and contact you
                        </p>
                        <Button variant="outline" size="sm">
                          Manage Privacy
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Change Password</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Update your account password for security
                        </p>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
