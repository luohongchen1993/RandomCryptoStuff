import tweepy
import random
import time

#################################### PRESET ##################################
##  https://realpython.com/twitter-bot-python-tweepy/#creating-twitter-api-authentication-credentials
##  https://docs.tweepy.org/en/stable/index.html

USER_KEY = ""
USER_SECRET = ""
ACCESS_KEY = ""
ACCESS_SECRET = ""

THREE_RANDOM_FRIENDS = " @xxx @yyy @zzz"
RANDOM_REPLY = ['This is COOL!', 'WAGMI', '#WAGMI', '#NFT', '#NFTCommunity','ON FIRE!']
#################################### END ##################################

def is_wl_related(tweet):
    text = tweet.full_text.lower()
    if (" wl " in text) or ("whitelist" in text):
        return True
    return False

def from_creator(status):
    if hasattr(status, 'retweeted_status'):
        return False
    elif status.in_reply_to_status_id != None:
        return False
    elif status.in_reply_to_screen_name != None:
        return False
    elif status.in_reply_to_user_id != None:
        return False
    else:
        return True

def interact(tweet, api, random_reply_list):
    # follow mentioned users in the tweet and the author:
    __ids = [tweet.user.id]
    __tweet_id = tweet.id
    for entity in tweet.entities['user_mentions']:
        user_id = entity['id']
        if user_id in __ids:
            continue
        __ids.append(user_id)
    for user_id in __ids:    
        _ = api.create_friendship(user_id=user_id)
        
    # retweet
    _ = api.retweet(__tweet_id)
    # like
    _ = api.create_favorite(__tweet_id)
    # reply and mention 3 friends
    _text = random.choice(random_reply_list) + THREE_RANDOM_FRIENDS
    _ = api.update_status(_text, in_reply_to_status_id=__tweet_id, auto_populate_reply_metadata=True)

def raffle():
    auth = tweepy.OAuthHandler(USER_KEY, USER_SECRET)
    auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
    api = tweepy.API(auth)

    try:
        api.verify_credentials()
        print("Authentication OK")
    except:
        print("Error during authentication")

    # Create API object
    api = tweepy.API(auth, wait_on_rate_limit=True)

    __since_id = None
    while True:
        for tweet in tweepy.Cursor(api.search_tweets, q='#NFTGiveaways OR WL Giveaway -filter:retweets -filter:replies', 
                                result_type="mixed", lang="en", 
                                count=50, tweet_mode = "extended", since_id=__since_id).items(50):
            _url = r"https://twitter.com/%s/status/%s"%(tweet.user.screen_name, tweet.id)

            # 1. pass if the tweet is not from the original creator
            tweet = api.get_status(tweet.id)
            if not from_creator(tweet):
                continue

            # 2. pass if favorite count < 10
            if tweet.favorite_count < 10:
                continue

            # 3. pass if I already interacted with the tweet
            if tweet.favorited or tweet.retweeted:
                continue

            # 4: interact with tweet
            interact(tweet, api, RANDOM_REPLY)
            print("interacted with: %s"%_url)
            
            # 5: record latest tweet id
            if __since_id is None:
                __since_id = tweet.id
            else:
                __since_id = max(tweet.id, __since_id)
            
            time.sleep(600)

if __name__ == "__main__":
    raffle()
    