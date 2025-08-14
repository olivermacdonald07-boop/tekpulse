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
import { Search, Plus, DollarSign, User, Clock, Tag, Image as ImageIcon, X } from "lucide-react";
import supabase from "@/lib/supabase";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);

  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [creatingListingError, setCreatingListingError] = useState("");
  const [listings, setListings] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const [listingItem, setListingItem] = useState<any>({
    title: "",
    price: 0,
    description: "",
    category: "other",
    condition: "new",
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

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "books", label: "Books" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "supplies", label: "Supplies" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      books: "bg-blue-100 text-blue-800",
      electronics: "bg-purple-100 text-purple-800",
      furniture: "bg-green-100 text-green-800",
      supplies: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition: string) => {
    const colors: { [key: string]: string } = {
      New: "bg-green-100 text-green-800",
      "Like New": "bg-emerald-100 text-emerald-800",
      Good: "bg-yellow-100 text-yellow-800",
      Used: "bg-orange-100 text-orange-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  const filteredItems = listings.filter((item: any) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleAddListing = async () => {
    if (listingItem.title.trim() === "") {
      setCreatingListingError("Title is required");
      return;
    }

    if (listingItem.description.trim() === "") {
      setCreatingListingError("Description is required");
      return;
    }

    if (listingItem.price <= 0) {
      setCreatingListingError("Price must be greater than 0");
      return;
    }

    if (listingItem.category.trim() === "") {
      setCreatingListingError("Category is required");
      return;
    }

    setIsCreatingListing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    let publicUrl: null | string = null;

    if (selectedImage) {
      const fileExt = selectedImage?.name.split(".").pop();
      const { data: imageData, error: uploadError } =
        await supabase.storage
          .from("market")
          .upload(
            `${user.id}/${Date.now()}.${fileExt}`,
            selectedImage as File
          );

      if (uploadError) {
        setIsCreatingListing(false);
        setCreatingListingError(uploadError.message);
        return;
      }

      let data = supabase.storage
        .from("market")
        .getPublicUrl(imageData.path);

      publicUrl = data.data.publicUrl;
    }

    const { error } = await supabase.from("product_listings").insert([
      {
        title: listingItem.title,
        description: listingItem.description,
        price: listingItem.price,
        category: listingItem.category,
        condition: listingItem.condition,
        user_id: user?.id,
        image_url: publicUrl,
      },
    ]);

    if (error) {
      setIsCreatingListing(false);
      setCreatingListingError(error.message);
      return;
    }
    setIsCreatingListing(false);
    setListingItem({ title: "", price: 0, description: "", category: "other", condition: "new" });
    removeImage();
    setIsListingDialogOpen(false);
    setCreatingListingError("");
    getProductListings();
  };

  const handleDeleteListing = async (listingId: any) => {
    const { error } = await supabase
      .from("product_listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      console.error(error);
    } else {
      getProductListings();
    }
  };

  const getProductListings = async () => {
    const { data, error } = await supabase
      .from("product_listings")
      .select(
        `*,
        author:profiles (
          id,
          full_name,
          profile_pic
        )`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setListings(data);
      console.log(data);
    }
  };

  useEffect(() => {
    getUserProfile();
    getProductListings();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Buy and sell items with fellow students
            </p>
          </div>
          <Dialog
            open={isListingDialogOpen}
            onOpenChange={setIsListingDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                List Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>List an Item</DialogTitle>
                <DialogDescription>
                  Create a listing to sell your item to other students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Textbook - 8th Edition"
                    value={listingItem.title}
                    onChange={(e) => {
                      setListingItem({
                        ...listingItem,
                        title: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45"
                    value={listingItem.price}
                    onChange={(e) =>
                      setListingItem({
                        ...listingItem,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue={listingItem.category}
                    value={listingItem.category}
                    onValueChange={(value) =>
                      setListingItem({ ...listingItem, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    defaultValue={listingItem.condition}
                    value={listingItem.condition}
                    onValueChange={(value) =>
                      setListingItem({ ...listingItem, condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the item"
                    rows={4}
                    value={listingItem.description}
                    onChange={(e) =>
                      setListingItem({
                        ...listingItem,
                        description: e.target.value,
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
                {creatingListingError && (
                  <p className="text-red-500">{creatingListingError}</p>
                )}
                <Button
                  className="w-full"
                  onClick={handleAddListing}
                  disabled={isCreatingListing}
                >
                  Create Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <Card key={item.id} className={`hover:shadow-lg transition-all duration-200 border-0 shadow-sm ${
              user?.is_admin ? 'border-l-4 border-l-red-500' : ''
            }`}>
              <div className="relative">
                {/* Price Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1">
                    ₵{item.price}
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
                  <h3 className="font-bold text-xl leading-tight line-clamp-2 mb-2">{item.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(item.category)} variant="secondary">
                      {item.category}
                    </Badge>
                    <Badge className={getConditionColor(item.condition)} variant="secondary">
                      {item.condition}
                    </Badge>
                  </div>
                </div>
                
                <CardDescription className="mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </CardDescription>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-muted-foreground">
                      {item?.author?.id === user?.id ? 'You' : item?.author?.full_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-muted-foreground">{moment(item.created_at).fromNow()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full font-medium"
                    variant={item?.author?.id === user?.id ? "destructive" : "default"}
                    onClick={() => {
                      if (item?.author?.id === user?.id) {
                        handleDeleteListing(item.id);
                      } else {
                        router.push(
                          `/messages?id=${item.id}&user=${item.author.id}&type=marketplace&name=${item.title}&description=${item.description}`
                        );
                      }
                    }}
                  >
                    {item?.author?.id === user?.id ? "Remove Listing" : "Contact Seller"}
                  </Button>
                  
                  {user?.is_admin && item?.author?.id !== user?.id && (
                    <Button
                      className="w-full font-medium"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteListing(item.id)}
                    >
                      Admin: Remove Listing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
