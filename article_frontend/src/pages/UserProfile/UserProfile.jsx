import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, User, LogOut, Shield } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/usersSlice"; 

const UserProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.users);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <div className="h-[80vh] mt-20">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-[80vh] mt-20">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No user logged in</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-[80vh] mt-20">
      <Card className="w-full max-w-2xl mx-auto shadow-lg ">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} />
              <AvatarFallback className="text-2xl">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2">
            <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>
              <Shield className="h-3 w-3 mr-1" />
              {currentUser.role || "User"}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Email Section */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-lg font-semibold">{currentUser.email}</p>
              </div>
            </div>

            {/* User ID Section */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-lg font-mono">{currentUser.id}</p>
              </div>
            </div>

            {/* Created At Section */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base">{formatDate(currentUser.created_at)}</p>
              </div>
            </div>

            {/* Updated At Section */}
            {currentUser.updated_at && currentUser.updated_at !== currentUser.created_at && (
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base">{formatDate(currentUser.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Account Actions */}
          <div className="flex justify-end">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>      
    </div>

  );
};

export default UserProfile;