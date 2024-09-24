
const loadImages = async (urls) => {
    const imagePromises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    });
    return Promise.all(imagePromises);
};


