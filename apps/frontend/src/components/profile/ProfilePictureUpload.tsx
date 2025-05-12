import { FC, useState } from 'react';
import { Avatar, Box, CircularProgress } from '@mui/material';
import { CameraAlt as CameraIcon } from '@mui/icons-material';
import { useProfilePictureUpload } from '../../services/profile.service';
import { useDropzone } from 'react-dropzone';

interface ProfilePictureUploadProps {
  userId: number;
  profilePictureUrl: string;
  size?: number;
  editable?: boolean;
}

/**
 * Component for uploading and displaying user avatar
 */
const ProfilePictureUpload: FC<ProfilePictureUploadProps> = ({
  userId,
  profilePictureUrl,
  size = 120,
  editable,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const uploadProfilePicture = useProfilePictureUpload(userId);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 3 * 1024 * 1024, // 3MB
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        try {
          await uploadProfilePicture.mutateAsync(file);
        } catch (error) {
          console.error('Avatar upload failed:', error);
        }
      }
    },
  });

  // No editing capabilities, just display the avatar
  if (!editable) {
    return (
      <Avatar
        src={profilePictureUrl}
        alt="User Avatar"
        sx={{ width: size, height: size }}
      />
    );
  }

  return (
    <Box
      {...getRootProps()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => open()}
      position="relative"
      sx={{
        width: size,
        height: size,
        cursor: 'pointer',
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    >
      <input {...getInputProps()} />

      <Avatar
        src={profilePictureUrl}
        alt="User Avatar"
        sx={{
          width: '100%',
          height: '100%',
          opacity: isHovering ? 0.6 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Overlay with camera icon when hovering */}
      {isHovering && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(0, 0, 0, 0.3)"
          color="white"
          borderRadius="50%"
        >
          <CameraIcon fontSize={size > 80 ? 'large' : 'medium'} />
        </Box>
      )}

      {/* Show loading indicator when uploading */}
      {uploadProfilePicture.isPending && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.7)"
          borderRadius="50%"
        >
          <CircularProgress size={size / 3} />
        </Box>
      )}
    </Box>
  );
};

export default ProfilePictureUpload;
