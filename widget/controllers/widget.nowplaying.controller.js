(function (angular) {
	angular.module('mediaCenterRSSPluginWidget').controller('NowPlayingCtrl', [
		'$scope',
		'Buildfire',
		'$rootScope',
		'$timeout',
		'Location',
		'ItemDetailsService',
		'Modals',
		function ($scope, Buildfire, $rootScope, $timeout, Location, ItemDetailsService, Modals) {
			console.log('----------------------------Now Playing controller loaded-------------------');
			//$rootScope.blackBackground = true;
			$rootScope.showFeed = false;

			var NowPlaying = this;
			NowPlaying.playing = false;
			NowPlaying.currentTime = 0;
			/**
			 * NowPlaying.item used to hold item details object
			 * @type {object}
			 */
			NowPlaying.item = ItemDetailsService.getData();
			if (NowPlaying.item) NowPlaying.currentTrack = new Track(NowPlaying.item);

			console.log('NowPlaying.currentTrack--------------------------------------', NowPlaying.currentTrack);

			console.log('NowPlaying.Item--------------------------------------------', NowPlaying.item);

			/**
			 * audioPlayer is Buildfire.services.media.audioPlayer.
			 */
			var audioPlayer = Buildfire.services.media.audioPlayer;
			audioPlayer.settings.get(function (err, setting) {
				NowPlaying.settings = setting;
				NowPlaying.volume = setting.volume;
			});

			buildfire.notes && buildfire.notes.onSeekTo && buildfire.notes.onSeekTo(function (data) {
				NowPlaying.changeTime(data.time);
			});
			/**
			 * audioPlayer.onEvent callback calls when audioPlayer event fires.
			 */

			var first = true;
			audioPlayer.onEvent(function (e) {
				switch (e.event) {
					case 'skip':
						NowPlaying.changeTime(e.data);
						break;
					case 'timeUpdate':
						var ready = e.data.duration > 0;
						if (ready && first && NowPlaying.item.seekTo) {
							NowPlaying.changeTime(NowPlaying.item.seekTo);
							first = false;
						}
						NowPlaying.currentTime = e.data.currentTime;
						NowPlaying.duration = e.data.duration;
						break;
					case 'audioEnded':
						NowPlaying.playing = false;
						NowPlaying.paused = false;
						break;
					case 'pause':
						NowPlaying.playing = false;
						break;
					case 'next':
						NowPlaying.currentTrack = e.data.track;
						NowPlaying.playing = true;
						break;
					case 'removeFromPlaylist':
						Modals.removeTrackModal();
						NowPlaying.playList = e.data && e.data.newPlaylist && e.data.newPlaylist.tracks;
						break;
				}
				$scope.$digest();
			});

			/**
			 * Player related method and variables
			 */
			NowPlaying.playTrack = function () {
				if (NowPlaying.settings) {
					NowPlaying.settings.isPlayingCurrentTrack = true;
					NowPlaying.settings.autoJumpToLastPosition = true;
					audioPlayer.settings.set(NowPlaying.settings);
				} else {
					audioPlayer.settings.get(function (err, setting) {
						NowPlaying.settings = setting;
						NowPlaying.settings.isPlayingCurrentTrack = true;
						NowPlaying.settings.autoJumpToLastPosition = true;
						audioPlayer.settings.set(NowPlaying.settings);
					});
				}
				NowPlaying.playing = true;
				if (NowPlaying.paused) {
					audioPlayer.play();
				} else {
					audioPlayer.play(NowPlaying.currentTrack);
				}
			};
			NowPlaying.playlistPlay = function (track) {
				if (NowPlaying.settings) {
					NowPlaying.settings.isPlayingCurrentTrack = true;
					audioPlayer.settings.set(NowPlaying.settings);
				}
				NowPlaying.playing = true;
				if (track) {
					audioPlayer.play({
						url: track.url
					});
					track.playing = true;
				}
			};
			NowPlaying.pauseTrack = function () {
				if (NowPlaying.settings) {
					NowPlaying.settings.isPlayingCurrentTrack = false;
					audioPlayer.settings.set(NowPlaying.settings);
				}
				NowPlaying.playing = false;
				NowPlaying.paused = true;
				audioPlayer.pause();
			};
			NowPlaying.playlistPause = function (track) {
				if (NowPlaying.settings) {
					NowPlaying.settings.isPlayingCurrentTrack = false;
					audioPlayer.settings.set(NowPlaying.settings);
				}
				track.playing = false;
				NowPlaying.playing = false;
				NowPlaying.paused = true;
				audioPlayer.pause();
			};
			NowPlaying.forward = function () {
				if (NowPlaying.currentTime + 5 >= NowPlaying.currentTrack.duration) audioPlayer.setTime(NowPlaying.currentTrack.duration);
				else audioPlayer.setTime(NowPlaying.currentTime + 5);
			};

			NowPlaying.backward = function () {
				if (NowPlaying.currentTime - 5 > 0) audioPlayer.setTime(NowPlaying.currentTime - 5);
				else audioPlayer.setTime(0);
			};
			NowPlaying.shufflePlaylist = function () {
				if (NowPlaying.settings) {
					NowPlaying.settings.shufflePlaylist = NowPlaying.settings.shufflePlaylist ? false : true;
				}
				audioPlayer.settings.set(NowPlaying.settings);
			};

			NowPlaying.loopPlaylist = function () {
				if (NowPlaying.settings) {
					NowPlaying.settings.loopPlaylist = NowPlaying.settings.loopPlaylist ? false : true;
				}
				audioPlayer.settings.set(NowPlaying.settings);
			};
			NowPlaying.addToPlaylist = function (track) {
				if (track) {
					audioPlayer.addToPlaylist(track);
					buildfire.components.toast.showToastMessage({text: "Added to playlist"}, console.log);
				}
			};
			NowPlaying.removeFromPlaylist = function (track) {
				if (NowPlaying.playList) {
					NowPlaying.playList.filter(function (val, index) {
						if (val.url == track.url) audioPlayer.removeFromPlaylist(index);
						return index;
					});
					buildfire.components.toast.showToastMessage({text: "Removed from playlist"}, console.log);
				}
			};
			NowPlaying.removeTrackFromPlayList = function (index) {
				audioPlayer.removeFromPlaylist(index);
				buildfire.components.toast.showToastMessage({text: "Removed from playlist"}, console.log);
			};
			NowPlaying.getFromPlaylist = function () {
				audioPlayer.getPlaylist(function (err, data) {
					if (data && data.tracks) {
						NowPlaying.playList = data.tracks;
						$scope.$digest();
					}
				});
				NowPlaying.openMoreInfo = false;
				$rootScope.playlist = true;
			};
			NowPlaying.changeTime = function (time) {
				audioPlayer.setTime(time);
			};
			NowPlaying.getSettings = function () {
				NowPlaying.openSettings = true;
				audioPlayer.settings.get(function (err, data) {
					if (data) {
						NowPlaying.settings = data;
						if (!$scope.$$phase) {
							$scope.$digest();
						}
					}
				});
			};
			NowPlaying.setSettings = function (settings) {
				var newSettings = new AudioSettings(settings);
				audioPlayer.settings.set(newSettings);
			};
			NowPlaying.addEvents = function (e, i, toggle) {
				toggle ? (NowPlaying.swiped[i] = true) : (NowPlaying.swiped[i] = false);
			};
			NowPlaying.openMoreInfoOverlay = function () {
				NowPlaying.openMoreInfo = true;
			};
			NowPlaying.closeSettingsOverlay = function () {
				NowPlaying.openSettings = false;
			};
			NowPlaying.closePlayListOverlay = function () {
				$rootScope.playlist = false;
			};
			NowPlaying.closeMoreInfoOverlay = function () {
				NowPlaying.openMoreInfo = false;
			};

			NowPlaying.addEvents = function (e, i, toggle, track) {
				toggle ? (track.swiped = true) : (track.swiped = false);
			};

			NowPlaying.bookmark = function ($event) {
				$event.stopImmediatePropagation();
				var isBookmarked = NowPlaying.item.bookmarked ? true : false;
				if (isBookmarked) {
					bookmarks.delete($scope, NowPlaying.item);
				} else {
					bookmarks.add($scope, NowPlaying.item);
				}
			};

			NowPlaying.share = function () {
				var options = {
					subject: NowPlaying.item.title,
					text: NowPlaying.item.title + ", by " + NowPlaying.item.author,
					// image: NowPlaying.item.image.url,
					link: NowPlaying.item.link
				};
				var callback = function (err) {
					if (err) {
						console.warn(err);
					}
				};
				buildfire.device.share(options, callback);
			};

			NowPlaying.addNote = function () {
				NowPlaying.pauseTrack();
				var options = {
					itemId: $scope.NowPlaying.item.guid,
					title: $scope.NowPlaying.item.title,
					imageUrl: $scope.NowPlaying.item.imageSrcUrl,
					timeIndex: $scope.NowPlaying.currentTime
				};
				var callback = function (err, data) {
					if (err) throw err;
					console.log(data);
				};
				// buildfire.input.showTextDialog(options, callback);
				buildfire.notes.openDialog(options, callback);
			};

			/**
			 * Track Smaple
			 * @param title
			 * @param url
			 * @param image
			 * @param album
			 * @param artist
			 * @constructor
			 */

			function Track(track) {
				console.log('Track-----------------------------------------------------', track);
				this.title = track && track.title;
				if (track && track['media:content'] && track['media:content'] && track['media:content']['@'] && track['media:content']['@'].url && track['media:content']['@'].url.substring(track['media:content']['@'].url.length - 4, track['media:content']['@'].url.length) == '.mp3') {
					this.url = track && track['media:content'] && track['media:content'] && track['media:content']['@'] && track['media:content']['@'].url;
				} else if (track && track.link && track.link.substring(track.link.length - 4, track.link.length) == '.mp3') {
					this.url = track && track.link;
				} else if (track && track.enclosures && track.enclosures[0] && track.enclosures[0].url && track.enclosures[0].url.substring(track.enclosures[0].url.length - 4, track.enclosures[0].url.length)) {
					this.url = track.enclosures[0].url;
				} else {
					console.error('**************************URL not found***********************');
				}
				this.image = track && track.imageSrcUrl;
				this.album = '';
				this.artist = track && track.author;
				this.startAt = 0; // where to begin playing
				this.lastPosition = 0; // last played to
			}

			/**
			 * AudioSettings sample
			 * @param autoPlayNext
			 * @param loop
			 * @param autoJumpToLastPosition
			 * @param shufflePlaylist
			 * @constructor
			 */
			function AudioSettings(settings) {
				this.autoPlayNext = settings.autoPlayNext; // once a track is finished playing go to the next track in the play list and play it
				this.loopPlaylist = settings.loopPlaylist; // once the end of the playlist has been reached start over again
				this.autoJumpToLastPosition = settings.autoJumpToLastPosition; //If a track has [lastPosition] use it to start playing the audio from there
				this.shufflePlaylist = settings.shufflePlaylist; // shuffle the playlist
				this.isPlayingCurrentTrack = settings.isPlayingCurrentTrack; // tells whether current track is playing or not
			}

			/**
			 * auto play the song
			 */
			$timeout(function () {
				console.log('Auto play called-------------------------');
				NowPlaying.playTrack();
			}, 100);

			/**
			 * Implementation of pull down to refresh
			 */
			var onRefresh = Buildfire.datastore.onRefresh(function () {});

			buildfire.auth.onLogin(function () {});

			buildfire.auth.onLogout(function () {});

			/**
			 * Unbind the onRefresh
			 */
			$scope.$on('$destroy', function () {
				$rootScope.blackBackground = false;
				onRefresh.clear();
				Buildfire.datastore.onRefresh(function () {});
			});
		}
	]);
})(window.angular);