# Changelog

All notable changes to the AI Video Composer project are documented here.

## [2026-02-17] - UI Enhancements and Card-Based Design
### Added
- Action buttons in render section title bar
  - Import button to add rendered video to library
  - Download button to save video locally
  - Reload button to copy video to compose section
- Video thumbnail generation for imported/reloaded videos
- Duplicate prevention for import and reload actions

### Changed
- Converted all sections to card-based design with rounded corners and shadows
- Updated section titles with consistent icon styling
  - Library: Upload icon
  - Compose: Film icon
  - Render: Play icon
- Made all title bars static width to prevent layout shifts
- Centered video player in render section
- Removed inner padding from render section for full-width video display
- Improved button sizing and spacing consistency across sections
- Cleaned up backend startup logs (removed emojis and model specifications)

### Fixed
- Duplicate files being added when clicking import/reload buttons multiple times
- Video thumbnail display when adding rendered videos to library or compose
- Title bar height consistency across all sections

## [2026-02-16] - 02:18:27
### Changed
- Improved the design of editor/preview UI
- Enhanced visual styling and user interface components
- Refined layout and component organization

## [2026-02-15] - 13:26:37
### Added
- Generate video thumbnails functionality
- Canvas-based thumbnail generation for video files
- Improved file preview system

### Changed
- Refine UI elements and interactions
- Better file card display

## [2026-02-14] - 18:30:12
### Changed
- Replace Gemini with Groq AI integration
- Updated API service to use Groq's language models
- UI output tweaks and improvements
- Better error handling and processing feedback

## [2026-02-14] - 14:53:26
### Added
- Integrate Create grid functionality
- API video processing pipeline
- File selection and management system
- Video processing with FFmpeg commands

### Changed
- Enhanced file handling between sections
- Improved state management

## [2026-02-13] - 20:54:05
### Added
- Editor UI components
  - Sidebar for file management
  - Preview canvas for video display
  - Process viewer for command output
- Three-section workflow layout
- Basic file upload and display

## [2026-02-11] - 18:20:42
### Added
- Initial project scaffold
- React + TypeScript frontend setup with Vite
- FastAPI backend structure
- Basic project configuration
- Development environment setup

## [2026-02-11] - 16:55:07
### Added
- Initial commit
- Repository initialization
- Project structure foundation
