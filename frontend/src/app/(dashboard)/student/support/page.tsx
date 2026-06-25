"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService } from "@/services/support.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { LifeBuoy, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { TicketCategory } from "@/types";

export default function SupportPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<TicketCategory>("wallet_issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: () => supportService.getMyTickets(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => supportService.createTicket(user!.id, user!.name, category, subject, description),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu hỗ trợ");
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      setShowForm(false);
      setSubject("");
      setDescription("");
    },
    onError: () => toast.error("Gửi yêu cầu thất bại"),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Trung tâm hỗ trợ" description="Gửi phản hồi hoặc yêu cầu trợ giúp đến Ban quản lý" />

      {showForm ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Tạo yêu cầu mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loại vấn đề</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet_issue">Lỗi nạp tiền / Ví tiền</SelectItem>
                  <SelectItem value="card_issue">Lỗi quẹt thẻ / Mất thẻ</SelectItem>
                  <SelectItem value="staff_attitude">Phản ánh thái độ nhân viên</SelectItem>
                  <SelectItem value="other">Vấn đề khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="VD: Nạp tiền Momo bị lỗi..." />
            </div>
            <div className="space-y-2">
              <Label>Nội dung chi tiết</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả rõ vấn đề của bạn..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!subject || !description || createMutation.isPending} className="gap-2">
                <Send className="h-4 w-4" /> {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" /> Tạo yêu cầu hỗ trợ
        </Button>
      )}

      <div className="grid gap-4">
        {tickets?.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <div className="flex border-l-4 border-primary">
              <CardContent className="p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === "open" ? "secondary" : t.status === "in_progress" ? "default" : "outline"} className="uppercase text-[10px]">
                      {t.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                </div>
                <h4 className="font-semibold">{t.subject}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                
                {t.responses && t.responses.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm border">
                    <p className="font-semibold text-primary text-xs mb-1">Phản hồi từ {t.responses[t.responses.length-1].senderName}:</p>
                    <p>{t.responses[t.responses.length-1].message}</p>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
        {tickets?.length === 0 && !showForm && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            Chưa có yêu cầu hỗ trợ nào
          </div>
        )}
      </div>
    </div>
  );
}
