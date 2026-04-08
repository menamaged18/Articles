<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Reaction;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string'
        ]);

        $article = Article::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content']
        ]);

        return response()->json($article, 201);
    }

    /*
     * main idea is if the user is logged in fetch if he has interacted with the post or not
     * else if there is no user fetch all without interactions
     * */
    public function index()
    {
        $user = auth('sanctum')->user();

        $articles = Article::with(['user:id,name'])
        ->withCount([
            'reactions as likes_count' => fn($q) => $q->where('type', 1),
            'reactions as dislikes_count' => fn($q) => $q->where('type', 0)
        ])
        ->addSelect([
            'user_reaction' => Reaction::select('type')
                ->whereColumn('article_id', 'articles.id')
                ->where('user_id', $user?->id)
                ->limit(1)
        ])
        ->latest()
        ->paginate(5);
        // data returned changed from a flat array to:
        // { data: [...], current_page: 1, ... }
        // because of the pagination
        return response()->json($articles);
    }

    public function userArticles()
    {
        $user = auth('sanctum')->user();

        $articles = Article::where('user_id', $user->id)
            ->withCount([
                'reactions as likes_count' => fn($q) => $q->where('type', 1),
                'reactions as dislikes_count' => fn($q) => $q->where('type', 0)
            ])
            ->addSelect([
                'user_reaction' => Reaction::select('type')
                    ->whereColumn('article_id', 'articles.id')
                    ->where('user_id', $user->id)
                    ->limit(1)
            ])
            ->latest()
            ->paginate(5);

        return response()->json($articles);
    }

    // Single Article by id
    public function show($id)
    {
        return Article::with('user', 'reactions')->findOrFail($id);
    }

    public function update(Request $request, $articleId)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string'
        ]);

        $article = Article::findOrFail($articleId);
        $article->update([
            'title' => $validated['title'],
            'content' => $validated['content']
        ]);

        return response()->json($article);
    }

    public function destroy($id){
        Article::destroy($id);
        return response(null, 204);
    }
}
