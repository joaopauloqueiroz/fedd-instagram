import React , { useState, useEffect, useCallback } from  'react'
import { View, FlatList } from 'react-native'

import { Post, Header, Description, Avatar, Name, Loading } from './styles'
import LazyImage from '../../components/LazyImage'

export default function Feed () {    
    const [feed, setFeed] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(1)
    const [loadig, setLoadig] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [viewAble, setViewAble] = useState([])

    async function loadPage(pageNumber = page, showldRfresh){
        if(total && pageNumber > total) return;
        setLoadig(true)
        const response = await fetch(
            `http:localhost:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`
        );
        const data = await response.json()
        const totalItems = response.headers.get('X-Total-Count')
        setTotal(Math.floor(totalItems / 5))
        setFeed(showldRfresh ? data : [...feed, ...data])
        setPage(pageNumber+1)
        setLoadig(false)
    }

    useEffect(() => {
        loadPage()
    }, [])

    async function refreshList(){
        setRefreshing(true)
        await loadPage(1, true)
        setRefreshing(false)
    }

    const handleViewChanched = useCallback(({ changed }) => {
        setViewAble(changed.map(({ item }) => item.id));
    }, [])

    return (
        <View>
           <FlatList 
            data={feed}
            keyExtractor={post => String(post.id)+post.author.avatar }
            onEndReached={() => loadPage()}
            onEndReachedThreshold={0.1}
            ListFooterComponent={loadig && <Loading />}
            onRefresh={refreshList}
            refreshing={refreshing}
            onViewableItemsChanged={handleViewChanched}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 20 }}
            renderItem={({ item }) => (
                <Post>
                    <Header>
                        <Avatar source={{ uri: item.author.avatar }} />
                        <Name>{item.author.name}</Name>
                    </Header>
                    <LazyImage
                        shouldLoad={viewAble.includes(item.id)}
                        aspectRatio={item.aspectRatio} 
                        smallSource={{ uri: item.small }}    
                        source={{ uri: item.image }}
                    />
                    <Description>
                        <Name>{item.author.name}</Name> {item.description}
                    </Description>
                </Post>
            )}
           />
        </View>
    )
}