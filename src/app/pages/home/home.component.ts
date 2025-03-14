import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  rotatingPhrases: string[] = [
    'No Hassle',
    'No Hidden Fees',
    'No Calls',
    'No Revisions',
  ];
  currentPhrase = '';
  targetPhrase = this.rotatingPhrases[0];
  phraseIndex = 0;
  charIndex = 0;
  isDeleting = false;
  typingSpeed = 100; // milliseconds per character
  pauseDelay = 1500; // pause at complete word
  animationTimeout: any;

  ngOnInit() {
    this.startTypingAnimation();
  }

  ngOnDestroy() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  startTypingAnimation() {
    // Get current phrase
    const currentPhrase = this.rotatingPhrases[this.phraseIndex];

    // Calculate typing speed - faster when deleting
    const typingSpeed = this.isDeleting
      ? this.typingSpeed / 2
      : this.typingSpeed;

    if (this.isDeleting) {
      // Remove a character
      this.currentPhrase = currentPhrase.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      // Add a character
      this.currentPhrase = currentPhrase.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    // Check if word is complete
    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      // Pause at the end of typing
      this.isDeleting = true;
      this.animationTimeout = setTimeout(
        () => this.startTypingAnimation(),
        this.pauseDelay
      );
      return;
    }

    // Check if deletion is complete
    if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      // Move to next phrase
      this.phraseIndex = (this.phraseIndex + 1) % this.rotatingPhrases.length;
    }

    // Continue the animation
    this.animationTimeout = setTimeout(
      () => this.startTypingAnimation(),
      typingSpeed
    );
  }
}
