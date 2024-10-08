import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Audio, Video, ResizeMode, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { View, Text, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { useTheme } from '@rneui/themed';
import PagerView from 'react-native-pager-view';
import { HeritageImage } from '../../types';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const Images = ({imageArr, videoUrl}: {imageArr: HeritageImage[], videoUrl: string | null}) => {
  const { theme } = useTheme();

  const videoRef = useRef<Video | null>(null);
  const videoCount = videoUrl ? 1 : 0;
  const [status, setStatus] = useState({ //video status
    progressUpdateIntervalMillis: 500,
    positionMillis: 0,
    shouldPlay: false,
    rate: 1.0,
    shouldCorrectPitch: false,
    volume: 1.0,
    isMuted: false,
    isLooping: false,
  });
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const enableAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: false,
      })
    }
    enableAudio();
  }, []);
  
  const checkVideoStatus = async () => { // 비디오 재생 상태 확인
    const status = await videoRef?.current?.getStatusAsync();
    
    // 비디오가 로드되었는지 확인 후 재생 상태 확인
    if (status?.isLoaded) {
      return status.isPlaying; // 비디오가 재생 중인지 반환
    } else {
      return false;
    }
  };

  const pageSelected = async (e: NativeSyntheticEvent<Readonly<{ position: number; }>>) => {
    const previousPage = currentPage; //뷰페이저 페이지 이동 전 페이지
    const newPage = e.nativeEvent.position; //이동 후 페이지
    setCurrentPage(newPage);

    const playing = await checkVideoStatus();
    if(previousPage == 0 && playing) { //다른 페이지로 넘어가면 비디오 정지
      videoRef?.current?.pauseAsync();
    }
    if(newPage == 0 && !playing){ //비디오 페이지로 오면 비디오 재생
      videoRef?.current?.playAsync();
    }
  }

  return (
    <View>
      {/* 'cannot read property "props" of null' 에러 방지를 위해 PagerView 출력 */}
      {videoUrl ? (
        <PagerView  
          style={styles.pagerContainer}
          initialPage={0}
          onPageSelected={(e) => pageSelected(e)}
        >
          <Video
            ref={videoRef}
            source={{
              uri: videoUrl,
            }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            status={status}
          />
          {imageArr.length > 0 && imageArr.slice(0, 10).map((imageItem, index) => (
            <Image
              key={index}
              source={imageItem.imageUrl}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            ))
          }
        </PagerView>
      ) : (
        <PagerView  
          style={styles.pagerContainer}
          initialPage={0}
          onPageSelected={(e) => pageSelected(e)}
        >
          {imageArr.length > 0 && imageArr.slice(0, 10).map((imageItem, index) => (
            <Image
              key={index}
              source={imageItem.imageUrl}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            ))
          }
        </PagerView>
      )}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {currentPage + 1} / {Math.min(imageArr.length + videoCount, 10)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pagerContainer: {
    width: '100%',
    height: 300,
    margin: 0,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  pageText: {
    color: '#fff',
    fontSize: 16,
  }
})

export default Images;
