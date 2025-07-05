// // ... existing imports ...
// import { MusicKit } from '@apple/music-kit-js';

// // ... existing code ...

// export async function searchAppleMusic(query: string) {
// 	try {
// 		const music = await MusicKit.getInstance();
// 		const results = await music.api.search(query, { types: 'songs', limit: 1 });

// 		if (results.songs && results.songs.data.length > 0) {
// 			return results.songs.data.map(song => ({
// 				url: `https://music.apple.com/us/song/${song.id}`,
// 				name: song.attributes.name,
// 				artist: song.attributes.artistName,
// 			}));
// 		}

// 		return null;
// 	} catch (error) {
// 		console.error('Error searching Apple Music:', error);
// 		return null;
// 	}
// }

// // ... rest of the existing code ...
