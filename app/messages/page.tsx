"use client";

import { useState, useEffect, useRef } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Plus, Circle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import supabase from "@/lib/supabase";
const moment = require("moment");
import React from "react";
import { useRouter, useSearchParams } from 'next/navigation'

// Utility: map position to bg color
const positionBg = (position: string | null) => {
  if (!position) return "";
  if (position.toLowerCase().includes("president"))
    return "bg-blue-100 text-blue-800";
  if (position.toLowerCase().includes("rep"))
    return "bg-green-100 text-green-800";
  if (position.toLowerCase().includes("secretary"))
    return "bg-yellow-100 text-yellow-800";
  return "bg-muted text-muted-foreground";
};

// Update parseAttachment to extract name and description if present
function parseAttachment(message: string) {
  // Matches: attachment(type): id(Name = Description);
  const match = message.match(
    /^attachment\(([^)]+)\):\s*([^(;]+)(?:\(([^=]+)=([^)]+)\))?;/i
  );
  if (!match) return null;
  return {
    type: match[1]?.trim(),
    id: match[2]?.trim(),
    name: match[3]?.trim() || null,
    description: match[4]?.trim() || null,
  };
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any>([]);
  const [conversations, setConversations] = useState<any>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<any>(null);
  const currentConversationRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const parsed = parseAttachment(newMessage);
    if (parsed) {
      setAttachmentPreview(parsed);
      setNewMessage(""); // Remove the string from the input
    }
    // Only set preview if pattern is present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage && !attachmentPreview) {
      alert("Please enter a message");
      return;
    }
    if (!currentConversation) {
      alert("Please select a conversation");
      return;
    }

    // If there's an attachment, prepend it to the message string
    let content = newMessage;
    if (attachmentPreview) {
      content =
        `attachment(${attachmentPreview.type}): ${attachmentPreview.id}(${attachmentPreview?.name} = ${attachmentPreview?.description});` +
        (newMessage ? " " + newMessage : "");
    }

    const { error } = await supabase.from("messages").insert({
      chat_room_id: currentConversation.id,
      sender_id: user.id,
      receiver_id: currentConversation.otherUser.id,
      content,
    });

    if (error) {
      console.error(error);
    } else {
      setNewMessage("");
      setAttachmentPreview(null);
    }
  };

  // Enhanced filter: search by name or position
  const filteredStudents = allUsers.filter((s: any) => {
    const term = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(term);
    // ||
    // (s.position && s.position.toLowerCase().includes(term))
  });

  const loadConversations = async () => {
    const { data: chatRooms, error } = await supabase
      .from("chat_members")
      .select(
        `
        chat_room_id,
        chat_room:chat_rooms (
          id,
          created_at,
          last_active,
          chat_members (
            user_id,
            profile:profiles (
              id,
              full_name,
              student_id,
              profile_pic
            )
          ),
          messages (
            id,
            content,
            created_at,
            sender_id,
            is_read
          ),
          unread_count:unread_message_counts (
            unread_count
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("chat_room.unread_message_counts.receiver_id", user.id)
      .order("created_at", {
        ascending: false,
        referencedTable: "chat_rooms.messages",
      })
      .limit(1, { foreignTable: "chat_rooms.messages" });

    if (error) {
      console.error(error);
      return;
    }

    const convos: any = [];

    for (const room of chatRooms) {
      // @ts-ignore
      const otherUser = room?.chat_room?.chat_members?.find(
        (m: any) => m.user_id !== user.id
      );

      // @ts-ignore
      const lastMessage = room?.chat_room?.messages[0];

      // @ts-ignore
      const unreadCount = room?.chat_room?.unread_count[0]?.unread_count;

      const conversation = {
        // @ts-ignore
        id: room?.chat_room?.id as any,
        name: otherUser?.profile?.full_name,
        otherUser: otherUser?.profile,
        lastMessage: lastMessage?.content,
        timestamp: moment(lastMessage?.created_at).fromNow(),
        unread: unreadCount,
        online: false,
      };

      convos.push(conversation);
    }

    setConversations(convos);
  };

  async function startConversation(id: any) {
    const { data: chatRooms, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        id,
        chat_members!inner (
          user_id,
          profile:profiles (
            id,
            full_name,
            profile_pic
          )
        )
      `
      )
      .in("chat_members.user_id", [user.id, id]);

    if (error) {
      console.error(error);
      return;
    }

    console.log(chatRooms);

    if (chatRooms?.[0]?.chat_members?.length  <= 1) {
      const { data: newRoom, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({})
        .select()
        .single();

      if (roomError) {
        console.error(roomError);
        return;
      }

      if (newRoom) {
        await supabase.from("chat_members").insert([
          { chat_room_id: newRoom.id, user_id: user.id },
          { chat_room_id: newRoom.id, user_id: id },
        ]);

        const selectedUser = allUsers.find((u: any) => u.id === id);

        const conversation = {
          name: selectedUser.full_name,
          id: newRoom.id,
          otherUser: selectedUser,
          lastMessage: "",
          timestamp: "",
          unread: 0,
          online: true,
        };

        setCurrentConversation(conversation);
      }
    } else if (chatRooms?.length > 0) {
      const user_profile: any = chatRooms[0].chat_members.find(
        (m) => m.user_id === id
      );

      const conversation = {
        name: user_profile?.profile?.full_name || "",
        id: chatRooms[0].id,
        otherUser: user_profile?.profile,
        lastMessage: "",
        timestamp: "",
        unread: 0,
        online: true,
      };

      setCurrentConversation(conversation);
    }
  }

  async function getMessages() {
    const currentConversation = currentConversationRef.current;

    if (!currentConversation) {
      return;
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_room_id", currentConversation?.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(messages);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_room_id", currentConversation?.id)
        .eq("receiver_id", user.id);
    }
  }

  async function checkForMessages() {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async () => {
          await getMessages();
          await loadConversations();
        }
      )
      .subscribe();
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

  const getUsers = async () => {
    const { data, error } = await supabase.from("profiles").select(`
      id,
      full_name,
      profile_pic,
      positions:member_positions(
        id,
        title,
        level,
        approved
      )
    `);

    if (error) {
      console.error(error);
    } else {
      let formatted = data.map((profile: any) => {
        const approvedPositions = profile.positions?.filter((pos: any) => pos.approved) || [];
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          profile_pic: profile.profile_pic,
          positions: approvedPositions.slice(0, 3),
        };
      });
      formatted = formatted.filter((_user: any) => _user.id !== user.id);

      setAllUsers(formatted);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      checkForMessages();

      const id = searchParams.get("id");
      const receiver_id = searchParams.get("user");
      const type = searchParams.get("type");
      const name = searchParams.get("name");
      const description = searchParams.get("description");

      if (id) {
        startConversation(receiver_id);

        setNewMessage(
          `attachment(${type}): ${id}(${name} = ${description});`)

          router.replace('/messages', { scroll: false })
      }
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      currentConversationRef.current = currentConversation;
      getMessages();
    }
  }, [currentConversation]);

  return (
    <ProtectedLayout>
      <div className="h-full flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  getUsers();
                  setShowStudentModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation: any) => (
              <div
                key={conversation.id}
                onClick={() => setCurrentConversation(conversation)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 border-b border-border/50",
                  currentConversation?.id === conversation.id 
                    ? "bg-primary/10 border-l-4 border-l-primary" 
                    : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      {conversation.otherUser?.profile_pic ? (
                        <img src={conversation.otherUser.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="text-base font-semibold">
                          {conversation.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        {conversation.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {conversation.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </span>
                        )}
                        {conversation.unread > 0 && (
                          <Badge
                            variant="default"
                            className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary"
                          >
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate leading-relaxed">
                      {conversation.lastMessage || "Start a conversation..."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new conversation to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      {currentConversation?.otherUser?.profile_pic ? (
                        <img src={currentConversation.otherUser.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback>
                          {currentConversation?.name?.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {currentConversation.online && (
                      <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{currentConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.online
                        ? "Active now"
                        : "Last seen 2 hours ago"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message: any) => {
                  const attachment = parseAttachment(message.content);
                  let messageText = message.content;
                  if (attachment) {
                    messageText = messageText.replace(
                      /^attachment\([^)]+\):\s*([^(;]+)(?:\([^)]+\))?;/i,
                      ""
                    );
                  }
                  const isOwn = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex space-x-2",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwn && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {currentConversation?.otherUser?.profile_pic ? (
                            <img src={currentConversation.otherUser.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {currentConversation?.name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <div className={cn("max-w-xs lg:max-w-md flex flex-col", isOwn && "items-end")}>
                        {/* Show attachment above message if exists */}
                        {attachment && (
                          <div className="mb-2">
                            <AttachmentPreview
                              type={attachment.type}
                              id={attachment.id}
                              name={attachment.name}
                              description={attachment.description}
                              isOwn={isOwn}
                            />
                          </div>
                        )}
                        {/* Show message text if any */}
                        {messageText.trim() && (
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl shadow-sm",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-white border rounded-bl-md"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{messageText}</p>
                          </div>
                        )}
                        {/* Timestamp */}
                        <p className={cn(
                          "text-xs text-muted-foreground mt-1 px-1",
                          isOwn ? "text-right" : "text-left"
                        )}>
                          {moment(message.created_at).format('HH:mm')}
                        </p>
                      </div>
                      {isOwn && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {user?.profile_pic ? (
                            <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {user?.full_name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                {/* Attachment preview above input */}
                {attachmentPreview && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <AttachmentPreview
                        type={attachmentPreview.type}
                        id={attachmentPreview.id}
                        name={attachmentPreview.name}
                        description={attachmentPreview.description}
                        isOwn={true}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAttachmentPreview(null);
                          setNewMessage("");
                        }}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="pr-12 py-3 rounded-full border-2 focus:border-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="rounded-full h-10 w-10 shrink-0"
                    disabled={!newMessage.trim() && !attachmentPreview}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Student Modal */}
        <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setShowStudentModal(false);
                      const existing = conversations.find(
                        (c: any) => c.name === student.full_name
                      );
                      if (existing) {
                        setCurrentConversation(existing);
                      } else {
                        // alert(`Start conversation with ${student.full_name}`);
                        startConversation(student.id);
                      }
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      {student.profile_pic ? (
                        <img src={student.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback>
                          {student.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-medium">{student.full_name}</span>
                      {student.positions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.positions.map((position: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {position.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground p-2">
                  No students found.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}

// Enhanced attachment preview component
function AttachmentPreview({
  type,
  id,
  name,
  description,
  isOwn = false,
}: {
  type: string;
  id: string;
  name?: string | null;
  description?: string | null;
  isOwn?: boolean;
}) {
  const getTypeIcon = () => {
    switch (type) {
      case 'marketplace':
        return '🛒';
      case 'lost-found':
        return '🔍';
      default:
        return '📎';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'marketplace':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'lost-found':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={cn(
      "max-w-sm p-3 rounded-xl border-2 shadow-sm transition-all hover:shadow-md",
      isOwn ? "bg-primary/5 border-primary/20" : getTypeColor()
    )}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full",
              isOwn ? "bg-primary/20 text-primary" : "bg-current/20"
            )}>
              {type}
            </span>
          </div>
          {name && (
            <h4 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
              {name}
            </h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70 mt-2">
            ID: {id}
          </p>
        </div>
      </div>
    </div>
  );
}
