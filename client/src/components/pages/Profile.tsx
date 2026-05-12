import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { toast } from "react-toastify";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      // In a real app, you'd fetch from an API endpoint
      // For now, we'll use the data from localStorage
      if (user) {
        const userProfile: UserProfile = {
          id: user.id,
          email: user.email,
          name: user.name || "",
        };
        setProfile(userProfile);
        setFormData({
          name: user.name || "",
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      // Call API to update profile (you'll need to implement this on the backend)
      const response = await api.put("/user/profile", {
        name: formData.name,
        email: formData.email,
      });

      const updatedUser = response.data.data;
      
      // Update localStorage and context
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfile(updatedUser);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      
      // Check for specific error responses from the backend
      if (error.response?.status === 409) {
        toast.error("This email is already registered by another user");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-base-content">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="card bg-white shadow-sm border border-[#e2e8f0] rounded-2xl">
          <div className="card-body">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b]">
                    {profile?.name}
                  </h2>
                  <p className="text-sm text-[#1e293b]/60">{profile?.email}</p>
                  {profile?.createdAt && (
                    <p className="text-xs text-[#1e293b]/40 mt-1">
                      Member since{" "}
                      {new Date(profile.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary btn-sm gap-2 rounded-lg"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
            </div>

            {/* Edit Form */}
            {isEditing ? (
              <div className="space-y-4 border-t border-[#e2e8f0] pt-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-[#1e293b]">
                      Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="input input-bordered w-full"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-[#1e293b]">
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    className="input input-bordered w-full"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="btn btn-ghost flex-1"
                    disabled={isSaving}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 border-t border-[#e2e8f0] pt-6">
                <div>
                  <label className="text-sm font-semibold text-[#1e293b]/60">
                    Name
                  </label>
                  <p className="text-[#1e293b] mt-1">{profile?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1e293b]/60">
                    Email
                  </label>
                  <p className="text-[#1e293b] mt-1">{profile?.email}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="border-t border-[#e2e8f0] mt-6 pt-6">
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-error w-full rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
