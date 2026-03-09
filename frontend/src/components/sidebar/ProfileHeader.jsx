import { useState, useRef } from "react";
import { LogOut, Moon, Sun, Volume2, VolumeX, Camera, Edit3, Check, X } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useThemeStore from "../../store/useThemeStore";
import Avatar from "../common/Avatar";

export default function ProfileHeader() {
  const { currentUser, logout, updateProfile } = useAuthStore();
  const { theme, toggleTheme, soundEnabled, toggleSound } = useThemeStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || "");
  const fileInputRef = useRef(null);

  if (!currentUser) return null;

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    await updateProfile(formData);
  };

  const handleBioSave = async () => {
    const formData = new FormData();
    formData.append("bio", bio);
    await updateProfile(formData);
    setIsEditingBio(false);
  };

  return (
    <div className="p-4 border-b border-base-300">
      {/* User info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative group">
          <Avatar src={currentUser.profilePic} alt={currentUser.fullname} size="w-12 h-12" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePicChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{currentUser.fullname}</p>
          <p className="text-xs text-base-content/50 truncate">{currentUser.email}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-3">
        {isEditingBio ? (
          <div className="flex items-center gap-1">
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input input-bordered input-xs flex-1"
              placeholder="Write a bio..."
              maxLength={150}
              autoFocus
            />
            <button onClick={handleBioSave} className="btn btn-ghost btn-xs btn-circle">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => { setIsEditingBio(false); setBio(currentUser.bio || ""); }} className="btn btn-ghost btn-xs btn-circle">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingBio(true)}
            className="flex items-center gap-1 text-xs text-base-content/60 hover:text-base-content transition-colors"
          >
            <span className="truncate">{currentUser.bio || "Add a bio..."}</span>
            <Edit3 className="w-3 h-3 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className="btn btn-ghost btn-sm btn-circle" title="Toggle theme">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={toggleSound} className="btn btn-ghost btn-sm btn-circle" title="Toggle sound">
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <div className="flex-1" />
        <button onClick={logout} className="btn btn-ghost btn-sm gap-1 text-error">
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}
