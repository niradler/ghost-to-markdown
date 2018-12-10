const fs = require("fs");
const data = fs.readFileSync('./another-tech-blog.ghost.2018-12-07.json', "utf8");
const TurndownService = require('turndown') 
const turndownService = new TurndownService()

const blog = JSON.parse(data);

try {
    fs.mkdirSync('./posts')
} catch (error) {
    
}


const getTag = (tagId) =>blog.db[0].data.tags.filter(t=>t.id == tagId);
const getPostsTags = (postId) =>blog.db[0].data.posts_tags.filter(p=>p.post_id == postId);

const convertPosts = (post) => {

    const { published_at, slug, html, title, plaintext, meta_description, custom_template, feature_image, id } = post;

    if (custom_template) {
        return;
    }

    let tags = getPostsTags(id).map(tag => getTag(tag.tag_id)).map(t => t[0].name)
    tags = tags.length == 0 ? ['Default'] : tags;
    const template = `---
layout: post
draft: false
path: "/posts/${slug}/"
tags: 
${tags.map(t=>'  - ' + t).join('\n')}
description: "${meta_description || plaintext.slice(0,250) + '...'}"
title: "${title}"
date: "${new Date(published_at).toISOString()}"
slug: "/${slug}/"
feature_image: ${feature_image}
author: "Nir Adler"
---

${turndownService.turndown(html)}
    `;

    const publishedAt = new Date(published_at);
    const day = publishedAt.getDate();
    const month = publishedAt.getMonth() + 1;
    const year = publishedAt.getFullYear();
    const filename = `${year}-${month}-${day}---${slug}`;

    fs.writeFileSync(`./posts/${filename}.md`, template, "utf8");
    return;
}

blog.db[0].data.posts.forEach(convertPosts);
