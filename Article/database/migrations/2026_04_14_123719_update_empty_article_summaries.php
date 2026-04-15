<?php

use App\Models\Article;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Chunking is better for performance if you have thousands of articles
        Article::whereNull('summary')->chunkById(100, function ($articles) {
            foreach ($articles as $article) {
                $article->update([
                    'summary' => Str::limit(strip_tags($article->content), 150)
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
