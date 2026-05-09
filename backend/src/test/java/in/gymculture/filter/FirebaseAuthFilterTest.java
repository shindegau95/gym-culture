package in.gymculture.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirebaseAuthFilterTest {

    @Mock private FirebaseAuth firebaseAuth;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain chain;
    @Mock private FirebaseToken firebaseToken;

    @InjectMocks private FirebaseAuthFilter filter;

    @BeforeEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContextAfter() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void valid_bearer_token_sets_security_context_and_invokes_chain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(firebaseAuth.verifyIdToken("valid-token")).thenReturn(firebaseToken);
        when(firebaseToken.getUid()).thenReturn("uid-abc");

        filter.doFilter(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo("uid-abc");
        verify(chain).doFilter(request, response);
        verify(response, never()).setStatus(eq(HttpServletResponse.SC_UNAUTHORIZED));
    }

    @Test
    void missing_authorization_header_passes_through_unauthenticated() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void invalid_token_returns_401_and_stops_chain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
        FirebaseAuthException ex = mockFirebaseAuthException();
        when(firebaseAuth.verifyIdToken("bad-token")).thenThrow(ex);

        filter.doFilter(request, response, chain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(chain, never()).doFilter(any(), any());
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private FirebaseAuthException mockFirebaseAuthException() {
        FirebaseAuthException ex = org.mockito.Mockito.mock(FirebaseAuthException.class);
        return ex;
    }
}
