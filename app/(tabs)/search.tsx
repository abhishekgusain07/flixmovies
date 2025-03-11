import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { images } from '@/constants/images'
import MovieCard from '@/components/Moviecard'
import useFetch from '@/services/useFetch'
import { fetchMovies } from '@/services/api'
import { icons } from '@/constants/icons'
import SearchBar from '@/components/searchBar'
import { updateSearchCount } from '@/services/appwrite'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset
  } = useFetch(() => fetchMovies({ query: debouncedQuery }), false);

  // Implement debouncing for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    
    const searchMovies = async() => {
      if(debouncedQuery.trim()) {
        await loadMovies()
      }else {
        reset()
      }
    }
    searchMovies();
  },[debouncedQuery])
  
  useEffect(() => {
    if(movies?.length > 0 && movies?.[0]) {
      updateSearchCount({query: debouncedQuery, movie:movies[0]})
    }
  },[movies])


  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover'/>
      <FlatList 
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()} 
        className='px-5'
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{ 
          paddingBottom: 100
        }}
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className='mt-10 px-5 items-center'>
              <Text className='text-center text-gray-400 text-lg'>
                {debouncedQuery.trim() 
                  ? `No movies found for "${debouncedQuery}"` 
                  : 'Search for a movie to get started'}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center mt-20 items-center'>
              <Image source={icons.logo} className='w-12 h-10' />
            </View> 
            <View className='my-5'>
              <SearchBar  
                placeholder='Search movies ...'
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {moviesLoading && (
              <View className='items-center'>
                <ActivityIndicator color="#fff" />
                <Text className='text-white mt-2'>Searching...</Text>
              </View>
            )}
            {moviesError && (
              <Text className='text-red-500 px-5 my-3'>
                Error: {moviesError.message}
              </Text>
            )}
            {!moviesLoading && !moviesError && searchQuery.trim() && movies?.length > 0 && (
              <Text className='text-xl text-white font-bold px-5'>
                Search Results for{' '}
                <Text className='text-accent'>{debouncedQuery}</Text>
              </Text>
            )}
          </>
        }
      />
    </View>
  )
}

export default Search
