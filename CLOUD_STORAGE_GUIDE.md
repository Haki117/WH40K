# WH40K Club Thun - Shared Storage Setup

## 🚀 What's New: Cloud Storage!

Your Warhammer 40K club application now supports **shared cloud storage** where all club members can see and update the same data in real-time!

## 🔧 How It Works

### **Local Mode (Default)**
- Data is stored in your browser's localStorage
- Works offline
- Data is private to your browser/device

### **Cloud Mode (New!)**
- Data is stored on the server
- Shared across all club members
- Real-time updates
- Automatic fallback to local storage if server is unavailable

## 🌟 Features

- **🔄 Automatic Sync**: Changes are automatically saved to the cloud
- **💾 Local Backup**: Data is also saved locally as backup
- **🌐 Real-time Sharing**: All club members see the same data
- **🔌 Offline Support**: Falls back to local storage when offline
- **⚡ Fast Switching**: Toggle between local and cloud storage instantly

## 📱 Using the Storage Toggle

1. **Storage Indicator**: Look for the storage status in the top header
   - 🌐 = Cloud storage active
   - 💾 = Local storage only

2. **Toggle Button**: Click "Go Online" or "Go Offline" to switch modes

3. **Status Messages**: The app will tell you when it's connected or disconnected

## 🚀 Deployment to Vercel

### Prerequisites
- Your code should be pushed to GitHub
- Vercel account connected to your GitHub repository

### Steps to Deploy

1. **Push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "Add cloud storage support"
   git push origin main
   ```

2. **Vercel will automatically deploy** your changes

3. **Your API endpoint** will be available at:
   ```
   https://your-app-name.vercel.app/api/data
   ```

### Vercel Configuration

The included `vercel.json` configures:
- API functions runtime
- Proper routing for the data API

## 🔧 Technical Details

### API Endpoint
- **URL**: `/api/data`
- **Methods**: GET (load data), POST (save data)
- **Data Types**: players, games, seasons, full

### Data Structure
```json
{
  "players": [...],
  "games": [...],
  "seasons": [...],
  "lastUpdated": "2025-10-16T15:00:00Z"
}
```

### Storage Priority
1. Cloud storage (if online and available)
2. Local storage (fallback)
3. Empty data (if both fail)

## 🎯 For Club Members

### First Time Setup
1. Open the app: `https://wh40l-scoreboard.vercel.app/`
2. Click "Go Online" in the header
3. Start adding players and games
4. All data will be shared with other members

### Daily Usage
- Just use the app normally
- All changes are automatically saved and shared
- Other members will see your updates immediately
- Works on any device with internet access

### Offline Usage
- Click "Go Offline" to use local storage
- Your data won't be shared until you go back online
- Good for tournaments or areas with poor internet

## 🛠️ Troubleshooting

### "Unable to connect to cloud storage"
- Check your internet connection
- The server might be temporarily unavailable
- App will automatically fall back to local storage

### "Data not syncing"
- Try refreshing the page
- Toggle offline/online mode
- Check the storage indicator in the header

### "Lost my data"
- Data is backed up locally in your browser
- Try the export/import functionality
- Contact the app administrator

## 🔒 Data Privacy

- All club data is stored on Vercel's secure servers
- No personal information is collected
- Data is only accessible to people with the app URL
- Local storage remains private to your device

## 📞 Support

For technical issues or questions:
1. Check the storage toggle indicator
2. Try refreshing the page
3. Use the export/import buttons as backup
4. Contact your club's tech administrator

---

**Enjoy your enhanced Warhammer 40K club experience! ⚔️**