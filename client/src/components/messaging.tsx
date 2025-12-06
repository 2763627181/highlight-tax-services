import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, User, ChevronLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Message } from "@shared/schema";

interface Conversation {
  partnerId: number;
  partnerName: string;
  partnerRole: string;
  lastMessage: Message;
  unreadCount: number;
}

interface Preparer {
  id: number;
  name: string;
  role: string;
}

export function MessagingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedPreparer, setSelectedPreparer] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 5000,
  });

  const { data: preparers } = useQuery<Preparer[]>({
    queryKey: ["/api/preparers"],
    enabled: !!user && user.role === "client",
  });

  const { data: clients } = useQuery<{ id: number; name: string; email: string }[]>({
    queryKey: ["/api/admin/clients"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: number; message: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessageText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    if (showNewMessage && selectedPreparer) {
      sendMessageMutation.mutate({
        recipientId: parseInt(selectedPreparer),
        message: messageText.trim(),
      });
      setShowNewMessage(false);
      setSelectedConversation(parseInt(selectedPreparer));
    } else if (selectedConversation) {
      sendMessageMutation.mutate({
        recipientId: selectedConversation,
        message: messageText.trim(),
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="text-xs">Admin</Badge>;
      case "preparer":
        return <Badge variant="secondary" className="text-xs">Preparador</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Cliente</Badge>;
    }
  };

  if (showNewMessage) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewMessage(false)}
              data-testid="button-back-messages"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">Nuevo Mensaje</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {user?.role === "client" ? "Seleccionar Preparador" : "Seleccionar Cliente"}
            </label>
            <Select value={selectedPreparer} onValueChange={setSelectedPreparer}>
              <SelectTrigger data-testid="select-recipient">
                <SelectValue placeholder={user?.role === "client" ? "Seleccione un preparador" : "Seleccione un cliente"} />
              </SelectTrigger>
              <SelectContent>
                {user?.role === "client" ? (
                  preparers?.map((preparer) => (
                    <SelectItem key={preparer.id} value={preparer.id.toString()}>
                      {preparer.name} ({preparer.role === "admin" ? "Administrador" : "Preparador"})
                    </SelectItem>
                  ))
                ) : (
                  clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Escriba su mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="resize-none"
              data-testid="input-new-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || !selectedPreparer || sendMessageMutation.isPending}
              data-testid="button-send-new-message"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedConversation) {
    const partner = conversations?.find(c => c.partnerId === selectedConversation);
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              data-testid="button-back-conversations"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{partner ? getInitials(partner.partnerName) : "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{partner?.partnerName}</p>
              {partner && getRoleBadge(partner.partnerRole)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {messagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-3/4" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    data-testid={`message-item-${msg.id}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderId === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.createdAt), "HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t flex gap-2">
            <Textarea
              placeholder="Escriba su mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-testid="input-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-lg">Mensajes</CardTitle>
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount.count}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewMessage(true)}
            data-testid="button-new-conversation"
          >
            Nuevo Mensaje
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {conversationsLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedConversation(conv.partnerId)}
                  className="w-full p-4 text-left hover-elevate flex items-start gap-3"
                  data-testid={`conversation-item-${conv.partnerId}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(conv.partnerName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{conv.partnerName}</p>
                        {getRoleBadge(conv.partnerRole)}
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(conv.lastMessage.createdAt), "dd/MM HH:mm", { locale: es })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay conversaciones</p>
              {user?.role === "client" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNewMessage(true)}
                  data-testid="button-start-conversation"
                >
                  Iniciar conversación
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
