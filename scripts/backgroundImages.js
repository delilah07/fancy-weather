export const backgroundImages = (keywords) => {
    keywords = keywords ? `${keywords}` : `weather`;
    const url = `https://api.unsplash.com/photos/random?query=${keywords}&client_id=PlorE0Vg9NeRW3QHiBqM_nwThtrsAAJJKh32rxp4bpU`;
    let backgroundImage = document.body;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            let newImageSource = data.urls.regular;
            backgroundImage.setAttribute("style", `background-image: url("${newImageSource}")`);
        });
}