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
  Search,
  Plus,
  MapPin,
  Clock,
  User,
  Tag,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import moment from "moment";

export default function LostFoundPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [isReporting, setIsReporting] = useState(false);
  const [createReportError, setCreateReportError] = useState("");
  const [reports, setReports] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const reportsFiltered = reports.filter((report: any) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lostItems = reportsFiltered.filter(
    (report: any) => report.status === "lost"
  );
  const foundItems = reportsFiltered.filter(
    (report: any) => report.status === "found"
  );

  const [reportItem, setReportItem] = useState<any>({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      bag: "bg-blue-100 text-blue-800",
      electronics: "bg-purple-100 text-purple-800",
      personal: "bg-green-100 text-green-800",
      books: "bg-orange-100 text-orange-800",
      accessories: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user?.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  const handleReport = async () => {
    if (reportItem.title.trim() === "") {
      setCreateReportError("Title is required");
      return;
    }

    if (reportItem.description.trim() === "") {
      setCreateReportError("Description is required");
      return;
    }

    if (reportItem.location.trim() === "") {
      setCreateReportError("Location is required");
      return;
    }
    if (reportItem.category.trim() === "") {
      setCreateReportError("Category is required");
      return;
    }
    setIsReporting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    let publicUrl: null | string = null;

    if (selectedImage) {
      const fileExt = selectedImage?.name.split(".").pop();
      const { data: imageData, error: uploadError } = await supabase.storage
        .from("lost-found")
        .upload(`${user.id}/${Date.now()}.${fileExt}`, selectedImage as File);

      if (uploadError) {
        setIsReporting(false);
        setCreateReportError(uploadError.message);
        return;
      }

      let data = supabase.storage
        .from("lost-found")
        .getPublicUrl(imageData.path);

      publicUrl = data.data.publicUrl;
    }

    const { error } = await supabase.from("lost_and_founds").insert([
      {
        title: reportItem.title,
        description: reportItem.description,
        location: reportItem.location,
        category: reportItem.category,
        user_id: user?.id,
        status: reportType,
        image_url: publicUrl,
      },
    ]);

    if (error) {
      setCreateReportError(error.message);
      setIsReporting(false);
      return;
    }

    setCreateReportError("");
    setIsReporting(false);
    setReportItem({ title: "", description: "", location: "", category: "" });
    removeImage();
    setIsReportDialogOpen(false);
    getReports();
  };

  const handleResolved = async (id: any) => {
    const { error } = await supabase
      .from("lost_and_founds")
      .update({
        is_resolved: true,
      })
      .eq("id", id);

    getReports();
    if (error) {
      console.error(error);
    }
  };

  const handleDeleteReport = async (reportId: any) => {
    const { error } = await supabase
      .from("lost_and_founds")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error(error);
    } else {
      getReports();
    }
  };

  const getReports = async () => {
    const { data, error } = await supabase
      .from("lost_and_founds")
      .select(
        `
        *,
        author:profiles (
          id,
          full_name,
          profile_pic
        ) 
        `
      )
      .eq("is_resolved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setReports(data);
    }
  };
  const ItemCard = ({ item }: { item: any }) => (
    <Card className={`hover:shadow-lg transition-all duration-200 border-0 shadow-sm ${
      user?.is_admin ? 'border-l-4 border-l-red-500' : ''
    }`}>
      <div className="relative">
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge 
            variant={item.status === 'lost' ? 'destructive' : 'default'}
            className="font-medium"
          >
            {item.status === 'lost' ? 'Lost' : 'Found'}
          </Badge>
        </div>
        
        {/* Item Image */}
        {item.image_url ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-muted/50 to-muted rounded-t-lg flex items-center justify-center">
            <Tag className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl leading-tight line-clamp-2">{item.title}</h3>
            <Badge className={getCategoryColor(item.category)} variant="secondary">
              {item.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium text-foreground">{item.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-muted-foreground">{moment(item.created_at).fromNow()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-muted-foreground">
              {item.author.id === user?.id ? 'You' : item.author.full_name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full font-medium"
            variant={item.author.id === user?.id ? "secondary" : "default"}
            onClick={(e) => {
              if (item.author.id === user?.id) {
                handleResolved(item.id);
                e.currentTarget.disabled = true;
              } else {
                router.push(
                  `/messages?id=${item.id}&user=${item.author.id}&type=lost-found&name=${item.title}&description=${item.description}`
                );
              }
            }}
          >
            {item.author.id === user?.id
              ? "Mark as Resolved"
              : "Contact Reporter"}
          </Button>
          
          {user?.is_admin && item.author.id !== user?.id && (
            <Button
              className="w-full font-medium"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteReport(item.id)}
            >
              Admin: Remove Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    getUserProfile();
    getReports();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
            <p className="text-muted-foreground">
              Help reunite lost items with their owners
            </p>
          </div>
          <Dialog
            open={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report an Item</DialogTitle>
                <DialogDescription>
                  Help others by reporting lost or found items on campus.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex space-x-2">
                  <Button
                    variant={reportType === "lost" ? "default" : "outline"}
                    onClick={() => setReportType("lost")}
                    className="flex-1"
                  >
                    Lost Item
                  </Button>
                  <Button
                    variant={reportType === "found" ? "default" : "outline"}
                    onClick={() => setReportType("found")}
                    className="flex-1"
                  >
                    Found Item
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blue Backpack"
                    value={reportItem.title}
                    onChange={(e) =>
                      setReportItem({ ...reportItem, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the item"
                    rows={3}
                    value={reportItem.description}
                    onChange={(e) =>
                      setReportItem({
                        ...reportItem,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Library - 2nd Floor"
                    value={reportItem.location}
                    onChange={(e) =>
                      setReportItem({ ...reportItem, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., electronics, bag, books"
                    value={reportItem.category}
                    onChange={(e) =>
                      setReportItem({
                        ...reportItem,
                        category: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Item Photo (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    {selectedImage && (
                      <span className="text-sm text-muted-foreground">
                        {selectedImage.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {createReportError && (
                  <p className="text-red-500">{createReportError}</p>
                )}
                <Button
                  className="w-full"
                  onClick={handleReport}
                  disabled={isReporting}
                >
                  Report {reportType === "lost" ? "Lost" : "Found"} Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">
              Lost Items ({lostItems.length})
            </TabsTrigger>
            <TabsTrigger value="found">
              Found Items ({foundItems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lost" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostItems.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {lostItems.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No lost items found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="found" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foundItems.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {foundItems.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No found items</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
