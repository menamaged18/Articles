<?php

namespace App\Http\Controllers;

use App\Models\Article;
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
        // Get the user from the sanctum guard specifically
        $user = auth('sanctum')->user();

        $articles = Article::withCount([
            'reactions as likes_count' => function ($query) {
                $query->where('type', 1);
            },
            'reactions as dislikes_count' => function ($query) {
                $query->where('type', 0);
            }
        ])
        ->withExists(['reactions as user_reaction' => function ($query) use ($user) {
            $query->where('user_id', $user?->id);
        }])
        ->get()
        ->map(function ($article) use ($user) {
            // If user is logged in, find specific reaction type
            if ($user) {
                $reaction = $article->reactions()->where('user_id', $user->id)->first();
                $article->user_reaction = $reaction ? (bool)$reaction->type : null;
            } else {
                $article->user_reaction = null;
            }
            return $article;
        });

        return response()->json($articles);
    }

    public function userArticles()
    {
        $user = auth('sanctum')->user();

        $articles = Article::where('user_id', $user?->id)
            ->withCount([
                'reactions as likes_count' => function ($query) {
                    $query->where('type', 1);
                },
                'reactions as dislikes_count' => function ($query) {
                    $query->where('type', 0);
                }
            ])
            ->withExists(['reactions as user_reaction' => function ($query) use ($user) {
                $query->where('user_id', $user?->id);
            }])
            ->get()
            ->map(function ($article) use ($user) {
                if ($user) {
                    $reaction = $article->reactions()->where('user_id', $user->id)->first();
                    $article->user_reaction = $reaction ? (bool) $reaction->type : null;
                } else {
                    $article->user_reaction = null;
                }
                return $article;
            });

        return response()->json($articles);
    }

    // Single Article by id
    public function show($id)
    {
        return Article::with('user', 'reactions')->findOrFail($id);
    }

    public function update(Request $request, $articleId){
        $validated = $request->validate([
            'title' => 'string',
            'content' => 'string'
        ]);

        Article::findOrFail($articleId)->update([
            'title' => $validated['title'],
            'content' => $validated['content']
        ]);
    }

    public function destroy($id){
        Article::destroy($id);
        return response(null, 204);
    }
}
