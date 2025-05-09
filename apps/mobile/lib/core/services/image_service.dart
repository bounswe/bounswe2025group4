import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';

class ImageService {
  final ImagePicker _picker = ImagePicker();

  Future<bool> _requestPermissions() async {
    if (Platform.isAndroid) {
      final status = await Permission.camera.request();
      if (status.isGranted) {
        final storageStatus = await Permission.storage.request();
        return storageStatus.isGranted;
      }
      return false;
    } else if (Platform.isIOS) {
      final status = await Permission.camera.request();
      if (status.isGranted) {
        final photosStatus = await Permission.photos.request();
        return photosStatus.isGranted;
      }
      return false;
    }
    return true;
  }

  Future<File?> pickImage({bool fromCamera = false}) async {
    try {
      // Check permissions
      final hasPermission = await _requestPermissions();
      if (!hasPermission) {
        throw Exception('Camera and storage permissions are required');
      }

      final XFile? image = await _picker.pickImage(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
        imageQuality: 70,
        maxWidth: 800,
        maxHeight: 800,
      );

      if (image == null) return null;

      // Create temporary file
      final Directory tempDir = await getTemporaryDirectory();
      final String tempPath = tempDir.path;
      final String fileName = 'profile_${DateTime.now().millisecondsSinceEpoch}${path.extension(image.path)}';
      final File tempFile = File('$tempPath/$fileName');

      // Copy file
      await image.saveTo(tempFile.path);
      return tempFile;
    } catch (e) {
      print('Error picking image: $e');
      rethrow;
    }
  }

  Future<String?> uploadImage(File imageFile) async {
    try {
      // TODO: Add API endpoint
      final url = Uri.parse('https://api.example.com/upload');
      
      var request = http.MultipartRequest('POST', url);
      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          imageFile.path,
        ),
      );

      var response = await request.send();
      if (response.statusCode == 200) {
        var responseData = await response.stream.bytesToString();
        // TODO: Parse URL returned from API
        return 'https://example.com/profile.jpg';
      }
      return null;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }

  Future<void> deleteImage(String imagePath) async {
    try {
      final file = File(imagePath);
      if (await file.exists()) {
        await file.delete();
      }
    } catch (e) {
      print('Error deleting image: $e');
    }
  }
} 