'use strict'; 

//WebApi service broken out in a class to give CRUD musicGroup, Album and Artist
class musicService {

    constructor (url)
    {
        this.url = url;
    }

    //#region private generic CRUD methods
    async #_myFetch(url, method = null, body = null) {
      try {
    
        method ??= 'GET';
        let res = await fetch(url, {
          method: method,
          headers: { 'content-type': 'application/json' },
          body: body ? JSON.stringify(body) : null
        });
    
        if (res.ok) {
    
          console.log(`\n${method} Request successful @ ${url}`);
    
          //get the data from server
          let data = await res.json();
          return data;
        }
        else {
    
          //typcially you would log an error instead
          console.log(`Failed to recieved data from server: ${res.status}`);
          alert(`Failed to recieved data from server: ${res.status}`);
        }
      }
      catch (err) {
    
        //typcially you would log an error instead
        console.log(`Failed to recieved data from server: ${err.message}`);
        alert(`Failed to recieved data from server: ${err.message}`);
      }
    }

    async #_readItemsAsync(reqUrl, pageNr, flat, filter, pageSize)
    {
      reqUrl += `?flat=${flat}&pageNr=${pageNr}&pageSize=${pageSize}`;
      if (filter != null)
      {
        reqUrl += `&filter=${filter}`
      }
      let data = await this.#_myFetch(reqUrl);
      return data;
    }
    
    async #_readItemAsync(reqUrl, id, flat)
    {
      reqUrl += `?flat=${flat}&id=${id}`;
      let data = await this.#_myFetch(reqUrl);
      return data;
    }

    async #_readItemDtoAsync(reqUrl, id, flat)
    {
      reqUrl += `?id=${id}`;
      let data = await this.#_myFetch(reqUrl);
      return data;
    }

    async #_updateItemAsync(reqUrl, id, newItem)
    {
      reqUrl += `/${id}`;
      let data = await this.#_myFetch(reqUrl, 'PUT', newItem);
      return data;
    }

    async #_createItemAsync(reqUrl, newItem)
    {
      let data = await this.#_myFetch(reqUrl, 'POST', newItem);
      return data;
    }

    async #_deleteItemAsync(reqUrl, id)
    {
      reqUrl += `/${id}`;
      let data = await this.#_myFetch(reqUrl, 'DELETE');
      return data;
    }

    async #_upsertItemAsync(reqUrl, newItem)
    {
      let data = await this.#_myFetch(reqUrl, 'POST', newItem);
      return data;
    }
    //#endregion

    async readInfoAsync() 
    {
      return await this.#_myFetch(`${this.url}/Guest/Info`);
    }

    //#region CRUD MusicGroup
    //using traditional function syntax (like in C#)
    async readMusicGroupsAsync(pageNr, flat=false, filter=null, pageSize=10) 
    {
      return await this.#_readItemsAsync(`${this.url}/MusicGroup/Read`, pageNr, flat, filter, pageSize);
    }
    
    //using JavaScrip's ability to asign a function to a variable or property (like c# delegate)
    readMusicGroupAsync = async (id, flat=true) => this.#_readItemAsync(`${this.url}/MusicGroup/ReadItem`, id, flat);
    
    readMusicGroupDtoAsync = async (id) => this.#_readItemDtoAsync(`${this.url}/MusicGroup/ReadItemDto`, id);
   
    updateMusicGroupAsync = async (id, newItem) => this.#_updateItemAsync(`${this.url}/MusicGroup/UpdateItem`, id, newItem);
  
    createMusicGroupAsync = async (newItem) => this.#_createItemAsync(`${this.url}/MusicGroup/CreateItem`, newItem);
 
    deleteMusicGroupAsync = async (id) => this.#_deleteItemAsync(`${this.url}/MusicGroup/DeleteItem`, id);
    //#endregion

    //#region CRUD Album
    readAlbumsAsync = async (pageNr, flat=false, filter=null, pageSize=10) => this.#_readItemsAsync(`${this.url}/Album/Read`, pageNr, flat, filter, pageSize);
    
    readAlbumAsync  = async (id, flat=true) => this.#_readItemAsync(`${this.url}/Album/ReadItem`, id, flat);

    readAlbumDtoAsync = async (id) => this.#_readItemDtoAsync(`${this.url}/Album/ReadItemDto`, id);

    updateAlbumAsync = async (id, newItem) => this.#_updateItemAsync(`${this.url}/Album/UpdateItem`, id, newItem);

    createAlbumAsync = async (newItem) => this.#_createItemAsync(`${this.url}/Album/CreateItem`, newItem);

    deleteAlbumAsync = async (id) => this.#_deleteItemAsync(`${this.url}/Album/DeleteItem`, id);
    //#endregion
    
    //#region CRUD Artist
    readArtistsAsync = async (pageNr, flat=false, filter=null, pageSize=10) => this.#_readItemsAsync(`${this.url}/Artist/Read`, pageNr, flat, filter, pageSize);
    
    readArtistAsync = async (id, flat=true) => this.#_readItemAsync(`${this.url}/Artist/ReadItem`, id, flat);

    readArtistDtoAsync = async (id, flat=true) => this.#_readItemDtoAsync(`${this.url}/Artist/ReadItemDto`, id);
    
    updateArtistAsync = async (id, newItem) => this.#_updateItemAsync(`${this.url}/Artist/UpdateItem`, id, newItem);

    upsertArtistAsync = async (newItem) => this.#_upsertItemAsync(`${this.url}/Artist/UpsertItem`, newItem);

    deleteArtistAsync = async (id) => this.#_deleteItemAsync(`${this.url}/Artist/DeleteItem`, id);
    //#endregion
}

export default musicService;
