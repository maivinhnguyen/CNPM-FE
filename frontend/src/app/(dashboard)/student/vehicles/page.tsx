"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicle.service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";

const vehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .regex(/^[0-9]{2}[A-Z][0-9]?-[0-9]{3,5}$/, "Format: 59F1-12345"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function StudentVehiclesPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    queryFn: () => vehicleService.getMyVehicles(user!.id),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (data: VehicleFormValues) =>
      vehicleService.addVehicle(user!.id, user!.name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      toast.success("Vehicle registered successfully!");
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: vehicleService.removeVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vehicles"] });
      toast.success("Vehicle removed");
    },
  });

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      licensePlate: "",
      brand: "",
      model: "",
      color: "",
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Vehicles"
        description="Manage your registered motorbikes"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Vehicle</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((v) => addMutation.mutate(v))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="59F1-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Honda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Wave Alpha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Red" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register Vehicle"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {vehicles?.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles registered"
          description="Add your motorbike to start using the parking system"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles?.map((vehicle) => (
            <Card key={vehicle.id} className="group relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold font-mono text-lg">
                        {vehicle.licensePlate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => removeMutation.mutate(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Color</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-medium">
                      {format(new Date(vehicle.registeredAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
